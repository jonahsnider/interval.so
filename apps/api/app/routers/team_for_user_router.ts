import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import { TeamManagerService } from '../team_manager/team_manager_service.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamManagerService)
export class TeamForUserRouter {
	constructor(private readonly teamManagerService: TeamManagerService) {}

	getRouter() {
		return router({
			join: authedProcedure
				.input(TeamSchema.pick({ inviteCode: true }).strict())
				.output(TeamSchema.pick({ slug: true }))
				.mutation(({ input, ctx }) => this.teamManagerService.joinTeam(input, ctx.user)),

			getTeamNames: authedProcedure
				.output(TeamSchema.pick({ displayName: true, slug: true, id: true }).array())
				.query(({ ctx }) => {
					return this.teamManagerService.teamNamesForUser(ctx.user);
				}),

			getRole: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamManagerSchema.pick({ role: true }))
				.query(({ ctx, input }) => {
					return this.teamManagerService.getUserRole(ctx.bouncer, input, ctx.user);
				}),

			leave: authedProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamManagerService.leave(ctx.bouncer, input, ctx.user);
				}),
		});
	}
}
