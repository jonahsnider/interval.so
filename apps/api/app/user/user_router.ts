import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';
import { UserSchema } from './schemas/user_schema.js';
import { UserService } from './user_service.js';

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
							user: await this.userService.getUser(ctx.context.bouncer, ctx.user),
						};
					}

					return {
						user: undefined,
					};
				}),
			deleteSelf: authedProcedure.mutation(async ({ ctx }) => {
				await this.userService.deleteUser(ctx.context.bouncer, ctx.user);
				ctx.context.session.clear();
			}),
			setDisplayName: authedProcedure.input(UserSchema.pick({ displayName: true })).mutation(async ({ input, ctx }) => {
				await this.userService.setDisplayName(ctx.context.bouncer, ctx.user, input);
			}),
		});
	}
}
