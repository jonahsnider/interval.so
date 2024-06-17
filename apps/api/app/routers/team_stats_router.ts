import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import { TeamStatsService } from '../team_stats/team_stats_service.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamStatsService)
export class TeamStatsRouter {
	constructor(private readonly teamStatsService: TeamStatsService) {}

	getRouter() {
		return router({
			getCombinedHours: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }))
				.output(z.number())
				.query(({ ctx, input }) => {
					return this.teamStatsService.getCombinedHours(ctx.context.bouncer, input.team, input.timeRange);
				}),
		});
	}
}
