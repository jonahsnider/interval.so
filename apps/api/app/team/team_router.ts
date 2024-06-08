import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';
import { TeamSchema } from './schemas/team_schema.js';
import { TeamService } from './team_service.js';

@inject()
@injectHelper(TeamService)
export class TeamRouter {
	constructor(private readonly teamService: TeamService) {}

	getRouter() {
		return router({
			teamNamesForSelf: authedProcedure
				.output(TeamSchema.pick({ displayName: true, slug: true }).array())
				.query(({ ctx }) => {
					return this.teamService.teamNamesForUser(ctx.user);
				}),
			create: authedProcedure
				.input(TeamSchema)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamService.create(input, ctx.user);
				}),
		});
	}
}
