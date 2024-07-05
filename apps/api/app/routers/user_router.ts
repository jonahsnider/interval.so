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
			getSelf: publicProcedure
				.output(
					z.object({
						user: UserSchema.pick({ displayName: true }).optional(),
					}),
				)
				.query(async ({ ctx }) => {
					if (ctx.user) {
						return {
							user: await this.userService.getUser(ctx.bouncer, ctx.user),
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
