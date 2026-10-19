import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { accountAuth } from '../auth/account_auth.ts';
import { injectHelper } from '../../util/inject_helper.ts';
import { AuthService } from '../auth/auth_service.ts';
import { AuthSessionService } from '../auth/auth_session_service.ts';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.ts';
import { UserSchema } from '../user/schemas/user_schema.ts';
import { UserService } from '../user/user_service.ts';

@inject()
@injectHelper(UserService, AuthService, AuthSessionService)
export class UserRouter {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly authSessionService: AuthSessionService,
	) {}

	getRouter() {
		return router({
			/**
			 * Checks if the session is authenticated with a non-guest account.
			 * Supposed to be very fast (just using Redis) to improve response times in any UI that blocks on checking if authed or unauthed
			 * (ex. the home screen, which is a dashboard or a landing page).
			 */
			isAuthedFast: publicProcedure.output(z.boolean()).query(({ ctx }) => {
				return ctx.user?.id !== undefined;
			}),
			getSelf: publicProcedure
				.output(
					z.object({
						user: UserSchema.pick({ displayName: true, id: true, teams: true }).optional(),
					}),
				)
				.query(async ({ ctx }) => {
					if (ctx.user) {
						const dbUser = await this.userService.getUser(ctx.bouncer, ctx.user);

						if (!dbUser) {
							return {
								user: undefined,
							};
						}

						return {
							user: {
								...dbUser,
								id: ctx.user.id,
							},
						};
					}

					return {
						user: undefined,
					};
				}),
			deleteSelf: authedProcedure.input(z.object({ body: z.any() })).mutation(async ({ ctx, input }) => {
				await this.authService.verifyReauthentication({
					body: input.body,
					session: ctx.session,
					userId: ctx.user.id,
					purpose: 'deleteAccount',
				});
				await this.userService.deleteUser(ctx.bouncer, ctx.user);
				await this.authSessionService.revokeSessions(ctx.user.id);
				const result = await accountAuth.api.signOut({ headers: ctx.authHeaders, returnHeaders: true });
				ctx.setAuthCookies(result.headers);
				AuthSessionService.end(ctx.session);
			}),
			setDisplayName: authedProcedure.input(UserSchema.pick({ displayName: true })).mutation(async ({ input, ctx }) => {
				await this.userService.setDisplayName(ctx.bouncer, ctx.user, input);
			}),
		});
	}
}
