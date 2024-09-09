import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { UserSchema } from '../user/schemas/user_schema.js';
import { UserService } from '../user/user_service.js';

@inject()
@injectHelper(UserService)
export class UserRouter {
	constructor(private readonly userService: UserService) {}

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
			deleteSelf: authedProcedure.mutation(async ({ ctx }) => {
				await this.userService.deleteUser(ctx.bouncer, ctx.user);
				ctx.session.clear();
			}),
			setDisplayName: authedProcedure.input(UserSchema.pick({ displayName: true })).mutation(async ({ input, ctx }) => {
				await this.userService.setDisplayName(ctx.bouncer, ctx.user, input);
			}),
		});
	}
}
