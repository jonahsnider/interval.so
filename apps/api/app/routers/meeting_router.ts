import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamMeetingService } from '../team_meeting/meeting_service.js';
import { TeamMeetingSchema } from '../team_meeting/schemas/team_meeting_schema.js';
import { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamMeetingService)
export class MeetingRouter {
	constructor(private readonly meetingService: TeamMeetingService) {}

	getRouter() {
		return router({
			getMeetings: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
				.output(z.array(TeamMeetingSchema))
				.query(({ ctx, input }) => {
					return this.meetingService.getMeetings(ctx.context.bouncer, input.team, input.timeRange);
				}),
		});
	}
}
