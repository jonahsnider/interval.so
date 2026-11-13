import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { fromNodeHeaders } from 'better-auth/node';
import type { AccountSession } from '../auth/create_account_auth.ts';
import { setAuthCookies } from '../auth/auth_response.ts';
import { AuthSessionService } from '../auth/auth_session_service.ts';

/** Resolves the request's Better Auth account session. */
export default class AccountMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const authSessions = await ctx.containerResolver.make(AuthSessionService);
		const authHeaders = fromNodeHeaders(ctx.request.headers());
		ctx.account = await authSessions.get(authHeaders, (headers) => setAuthCookies(ctx.response, headers), ctx.session);
		// The exchange's cookie must also reach auth handlers and tRPC in this same request.
		ctx.request.request.headers.cookie = authHeaders.get('cookie') ?? undefined;

		return next();
	}
}

declare module '@adonisjs/core/http' {
	export interface HttpContext {
		account: AccountSession | null;
	}
}
