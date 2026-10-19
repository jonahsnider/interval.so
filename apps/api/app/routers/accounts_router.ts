import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { accountAuth } from '../auth/account_auth.ts';
import { injectHelper } from '../../util/inject_helper.ts';
import { AuthService } from '../auth/auth_service.ts';
import { AuthSessionService } from '../auth/auth_session_service.ts';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.ts';

@inject()
@injectHelper(AuthService, AuthSessionService)
export class AccountsRouter {
	constructor(
		private readonly authService: AuthService,
		private readonly authSessionService: AuthSessionService,
	) {}

	getRouter() {
		return router({
			logOut: publicProcedure.mutation(async ({ ctx }) => {
				const result = await accountAuth.api.signOut({ headers: ctx.authHeaders, returnHeaders: true });
				ctx.setAuthCookies(result.headers);
				AuthSessionService.end(ctx.session);
			}),
			reauthenticate: authedProcedure
				.input(z.object({ purpose: z.enum(['deleteAccount', 'revokeOtherSessions']) }))
				.mutation(({ ctx, input }) => {
					return this.authService.getReauthenticationOptions(ctx.session, ctx.user.id, input.purpose);
				}),
			revokeOtherSessions: authedProcedure.input(z.object({ body: z.any() })).mutation(async ({ ctx, input }) => {
				await this.authService.verifyReauthentication({
					body: input.body,
					session: ctx.session,
					userId: ctx.user.id,
					purpose: 'revokeOtherSessions',
				});
				await this.authSessionService.revokeSessions(ctx.user.id, ctx.account!.session.token);
			}),
		});
	}
}
