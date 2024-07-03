import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { MeetingService } from '../team_meeting/meeting_service.js';
import { MeetingSubscriptionService } from '../team_meeting/meeting_subscription_service.js';
import { TeamMeetingSchema } from '../team_meeting/schemas/team_meeting_schema.js';
import { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(MeetingService, MeetingSubscriptionService)
export class MeetingRouter {
	constructor(
		private readonly meetingService: MeetingService,
		private readonly meetingSubscriptionService: MeetingSubscriptionService,
	) {}

	getRouter() {
		return router({
			getMeetings: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
				.output(z.array(TeamMeetingSchema))
				.query(({ ctx, input }) => {
					return this.meetingService.getMeetings(ctx.context.bouncer, input.team, input.timeRange);
				}),
			meetingsSubscription: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
				.subscription(({ ctx, input }): Promise<Observable<TeamMeetingSchema[], unknown>> => {
					return this.meetingSubscriptionService.meetingsSubscribe(ctx.context.bouncer, input.team, input.timeRange);
				}),

			getCurrentMeetingStart: authedProcedure
				.input(TeamSchema.pick({ slug: true }).strict())
				.output(z.object({ startedAt: TeamMeetingSchema.shape.startedAt.optional() }))
				.query(async ({ ctx, input }) => {
					const startedAt = await this.meetingService.getCurrentMeetingStart(ctx.context.bouncer, input);
					return { startedAt };
				}),

			deleteOngoingMeeting: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }) }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.meetingService.deleteOngoingMeeting(ctx.context.bouncer, input.team);
				}),
			deleteFinishedMeeting: authedProcedure
				.input(
					z
						.object({
							team: TeamSchema.pick({ slug: true }),
							meeting: TeamMeetingSchema.pick({ startedAt: true, endedAt: true }).extend({
								endedAt: z.date(),
							}),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.meetingService.deleteFinishedMeeting(ctx.context.bouncer, input.team, {
						start: input.meeting.startedAt,
						end: input.meeting.endedAt,
					});
				}),
		});
	}
}
