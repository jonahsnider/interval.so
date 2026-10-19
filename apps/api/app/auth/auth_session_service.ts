import { inject } from '@adonisjs/core';
import { SessionCollection, type Session } from '@adonisjs/session';
import { TRPCError } from '@trpc/server';
import { applySetCookies, getSessionCookie } from 'better-auth/cookies';
import { injectHelper } from '../../util/inject_helper.ts';
import { accountAuth } from './account_auth.ts';
import { ACCOUNT_MAX_AGE, isActiveAccountSession, type AccountSession } from './create_account_auth.ts';
import { withLegacySessionLock } from './legacy_session_lock.ts';

@inject()
@injectHelper(SessionCollection)
export class AuthSessionService {
	constructor(private readonly sessions: SessionCollection) {}

	static end(session: Session): void {
		session.clear();
		session.regenerate();
	}

	async get(
		headers: Headers,
		setCookies?: (headers: Headers) => void,
		legacySession?: Session,
	): Promise<AccountSession | null> {
		const result = await accountAuth.api.getSession({ headers, returnHeaders: true });
		setCookies?.(result.headers);
		if (result.response && isActiveAccountSession(result.response)) return result.response;
		if (legacySession && setCookies && !getSessionCookie(headers)) {
			return this.exchangeLegacySession(legacySession, headers, setCookies);
		}
		return null;
	}

	// Remove this exchange, its receipts/revocation marker, the lock, the server-only endpoint, and web/src/proxy.ts
	// once 90 days have elapsed since the LAST old API instance could issue an Adonis account session (including rollbacks).
	// The old 90-day absolute lifetime bounds eligibility even if a guest/preference request refreshes Redis's idle TTL.
	private async exchangeLegacySession(session: Session, headers: Headers, setCookies: (headers: Headers) => void) {
		const userId = session.get('userId');
		if (typeof userId !== 'string') return null;
		return withLegacySessionLock(userId, async () => {
			// Re-read storage under the lock; the request's snapshot may predate revocation.
			const data = await this.sessions.get(session.sessionId);
			const authenticatedAt = data?.authenticatedAt;
			const now = Date.now();
			if (
				data?.userId !== userId ||
				typeof authenticatedAt !== 'number' ||
				!Number.isFinite(authenticatedAt) ||
				authenticatedAt > now ||
				now - authenticatedAt >= ACCOUNT_MAX_AGE
			)
				return null;

			const { internalAdapter, secondaryStorage } = await accountAuth.$context;
			if (!secondaryStorage) throw new Error('Adonis session migration requires secondary storage');
			const receiptKey = `adonis-session-migration:${session.sessionId}`;
			const receipt = await secondaryStorage.get(receiptKey);
			if (receipt != null && typeof receipt !== 'string') throw new Error('Invalid Adonis session migration receipt');
			let token = receipt;
			if (!token) {
				if (await secondaryStorage.get(`adonis-session-revoked:${userId}`)) return null;
				if (!(await internalAdapter.findUserById(userId))) return null;
				const migrated = await internalAdapter.createSession(
					userId,
					false,
					{
						createdAt: new Date(authenticatedAt),
						expiresAt: new Date(Math.min(now + 30 * 24 * 60 * 60 * 1000, authenticatedAt + ACCOUNT_MAX_AGE)),
					},
					true,
				);
				if (!migrated) throw new Error('Unable to migrate Adonis account session');
				token = migrated.token;
				// Keep the receipt after logout/revocation. An old cookie may only resume this token, never mint another.
				await secondaryStorage.set(receiptKey, token, ACCOUNT_MAX_AGE / 1000);
			}
			const result = await accountAuth.api.resumeAdonisSession({ body: { token }, headers, returnHeaders: true });
			setCookies(result.headers);
			applySetCookies(headers, result.headers.getSetCookie());
			return result.response;
		});
	}

	async revokeSessions(userId: string, exceptToken?: string): Promise<void> {
		await withLegacySessionLock(userId, async () => {
			const { internalAdapter, secondaryStorage } = await accountAuth.$context;
			// Block unexchanged old cookies too, without blocking the current migrated token.
			await secondaryStorage?.set(`adonis-session-revoked:${userId}`, '1', ACCOUNT_MAX_AGE / 1000);
			if (!exceptToken) {
				await internalAdapter.deleteUserSessions(userId);
				return;
			}
			const sessions = await internalAdapter.listSessions(userId);
			await Promise.all(
				sessions
					.filter((session) => session.token !== exceptToken)
					.map((session) => internalAdapter.deleteSession(session.token)),
			);
		});
	}

	async assertActive(session: Session, headers: Headers, account: AccountSession | null): Promise<void> {
		// Long-lived subscriptions must consult storage rather than their connection's snapshot.
		if (account) {
			const current = await this.get(headers);
			if (!current || current.session.id !== account.session.id || current.user.id !== account.user.id) {
				throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' });
			}
			return;
		}
		if (session.has('guestToken')) {
			const data = await this.sessions.get(session.sessionId);
			if (!data || data.guestToken !== session.get('guestToken')) {
				throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' });
			}
		}
	}
}
