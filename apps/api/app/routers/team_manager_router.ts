import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import { TeamManagerService } from '../team_manager/team_manager_service.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';
import { UserSchema } from '../user/schemas/user_schema.js';

@inject()
@injectHelper(TeamManagerService)
export class TeamManagerRouter {
	constructor(private readonly teamManagerService: TeamManagerService) {}

	getRouter() {
		return router({
			getList: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamManagerSchema.array())
				.query(({ ctx, input }) => this.teamManagerService.getList(ctx.context.bouncer, input)),

			removeManager: authedProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }),
						user: UserSchema.pick({ id: true }),
					}),
				)
				.output(z.void())
				.mutation(({ ctx, input }) =>
					this.teamManagerService.removeManager(ctx.context.bouncer, input.team, input.user),
				),

			updateRole: authedProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }),
						user: UserSchema.pick({ id: true }),
						change: TeamManagerSchema.pick({ role: true }),
					}),
				)
				.output(z.void())
				.mutation(({ ctx, input }) =>
					this.teamManagerService.updateRole(ctx.context.bouncer, input.team, input.user, input.change),
				),
		});
	}
}
