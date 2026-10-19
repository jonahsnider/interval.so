import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.ts';
import { AuthService } from '../auth/auth_service.ts';
import { AuthSessionService } from '../auth/auth_session_service.ts';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.ts';
import { UserSchema } from '../user/schemas/user_schema.ts';

@inject()
@injectHelper(AuthService, AuthSessionService)
export class AccountsRouter {
	constructor(
		private readonly authService: AuthService,
		private readonly authSessionService: AuthSessionService,
	) {}

	getRouter() {
		return router({
			register: router({
				generateRegistrationOptions: publicProcedure
					.input(UserSchema.pick({ displayName: true }))
					.output(z.any())
					.use(({ next }) => {
						return next();
					})
					.mutation(async ({ input, ctx }) => {
						const options = await this.authService.getRegisterOptions({
							displayName: input.displayName,
							session: ctx.session,
						});

						return options;
					}),
				verifyRegistrationResponse: publicProcedure
					.input(
						z.object({
							body: z.any(),
							user: UserSchema.pick({ displayName: true }),
						}),
					)
					.mutation(async ({ input, ctx }) => {
						await this.authService.verifyRegister({
							body: input.body,
							displayName: input.user.displayName,
							session: ctx.session,
						});
					}),
			}),
			login: router({
				generateAuthenticationOptions: publicProcedure.output(z.any()).mutation(({ ctx }) => {
					return this.authService.getLoginOptions(ctx.session);
				}),
				verifyAuthenticationResponse: publicProcedure
					.input(z.object({ body: z.any() }))
					.output(UserSchema.pick({ displayName: true }))
					.mutation(({ input, ctx }) => {
						return this.authService.verifyLogin({
							body: input.body,
							session: ctx.session,
						});
					}),
			}),
			logOut: publicProcedure.mutation(({ ctx }) => {
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
				await this.authSessionService.revokeSessions(ctx.user.id, ctx.session.sessionId);
				await this.authSessionService.start(ctx.session, ctx.user.id);
			}),
		});
	}
}
