import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthService } from '../auth/auth_service.js';
import { publicProcedure, router } from '../trpc/trpc_service.js';
import { UserSchema } from '../user/schemas/user_schema.js';

@inject()
@injectHelper(AuthService)
export class AccountsRouter {
	constructor(private readonly authService: AuthService) {}

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
							context: ctx.context,
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
							context: ctx.context,
						});
					}),
			}),
			login: router({
				generateAuthenticationOptions: publicProcedure.output(z.any()).mutation(({ ctx }) => {
					return this.authService.getLoginOptions(ctx.context);
				}),
				verifyAuthenticationResponse: publicProcedure
					.input(z.object({ body: z.any() }))
					.output(UserSchema.pick({ displayName: true }))
					.mutation(({ input, ctx }) => {
						return this.authService.verifyLogin({
							body: input.body,
							context: ctx.context,
						});
					}),
			}),
			logOut: publicProcedure.mutation(({ ctx }) => {
				ctx.context.session.clear();
			}),
		});
	}
}
