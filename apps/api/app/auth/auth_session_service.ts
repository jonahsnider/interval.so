import { inject } from '@adonisjs/core';
import { SessionCollection, type Session } from '@adonisjs/session';
import type { SessionData } from '@adonisjs/session/types';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { injectHelper } from '../../util/inject_helper.ts';

@inject()
@injectHelper(SessionCollection)
export class AuthSessionService {
	static readonly MAX_AGE = convert(90, 'days').to('milliseconds');

	constructor(private readonly sessions: SessionCollection) {}

	static hasValidAuthentication(data: SessionData, now = Date.now()): boolean {
		const authenticatedAt = data.authenticatedAt;
		return (
			typeof authenticatedAt === 'number' &&
			Number.isFinite(authenticatedAt) &&
			authenticatedAt <= now &&
			now - authenticatedAt < AuthSessionService.MAX_AGE
		);
	}

	static end(session: Session): void {
		session.clear();
		session.regenerate();
	}

	static expire(session: Session): void {
		if (session.has('userId') && !AuthSessionService.hasValidAuthentication(session.all())) {
			AuthSessionService.end(session);
		}
	}

	async start(session: Session, userId: string): Promise<void> {
		// A verified passkey starts a new session, preventing session fixation.
		session.regenerate();
		session.put('userId', userId);
		session.put('authenticatedAt', Date.now());
		await session.tag(userId);
	}

	async revokeSessions(userId: string, exceptSessionId?: string): Promise<void> {
		const sessions = await this.sessions.tagged(userId);
		await Promise.all(
			sessions
				.filter((session) => session.id !== exceptSessionId && session.data.userId === userId)
				.map((session) => this.sessions.destroy(session.id)),
		);
	}

	async assertActive(session: Session): Promise<void> {
		if (!session.has('userId') && !session.has('guestToken')) {
			return;
		}

		// WebSocket contexts outlive HTTP requests, so check the persisted session.
		const data = await this.sessions.get(session.sessionId);
		if (
			!data ||
			data.userId !== session.get('userId') ||
			data.guestToken !== session.get('guestToken') ||
			(data.userId && !AuthSessionService.hasValidAuthentication(data))
		) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' });
		}
	}
}
