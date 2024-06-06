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
							user: await this.userService.getUser(ctx.user),
						};
					}

					return {
						user: undefined,
					};
				}),
			deleteSelf: authedProcedure.mutation(async ({ ctx }) => {
				await this.userService.deleteUser(ctx.user);
				// TODO: Figure out if this actually signs the user out on the browser
				ctx.context.session.clear();
			}),
			setDisplayName: authedProcedure.input(UserSchema.pick({ displayName: true })).mutation(async ({ input, ctx }) => {
				await this.userService.setDisplayName(ctx.user, input);
			}),
		});
	}
}
