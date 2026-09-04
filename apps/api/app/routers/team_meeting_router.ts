import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.ts';
import { TeamSchema } from '../team/schemas/team_schema.ts';
import { CreateTeamMeetingSchema } from '../team_meeting/schemas/create_team_meeting_schema.ts';
import { TeamMeetingSchema } from '../team_meeting/schemas/team_meeting_schema.ts';
import { TeamMeetingService } from '../team_meeting/team_meeting_service.ts';
import { TeamMeetingSubscriptionService } from '../team_meeting/team_meeting_subscription_service.ts';
import { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.ts';
import { authedProcedure, router } from '../trpc/trpc_service.ts';

@inject()
@injectHelper(TeamMeetingService, TeamMeetingSubscriptionService)
export class TeamMeetingRouter {
	constructor(
		private readonly meetingService: TeamMeetingService,
		private readonly meetingSubscriptionService: TeamMeetingSubscriptionService,
	) {}

	getRouter() {
		return router({
			getMeetings: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
				.output(z.array(TeamMeetingSchema))
				.query(({ ctx, input }) => {
					return this.meetingService.getMeetings(ctx.bouncer, input.team, input.timeFilter);
				}),
			meetingsSubscription: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
				.subscription(({ ctx, input }): Promise<Observable<TeamMeetingSchema[], unknown>> => {
					return this.meetingSubscriptionService.meetingsSubscribe(ctx.bouncer, input.team, input.timeFilter);
				}),

			create: authedProcedure
				.input(CreateTeamMeetingSchema)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.meetingService.createMeeting(ctx.bouncer, input);
				}),

			getCurrentMeetingStart: authedProcedure
				.input(TeamSchema.pick({ slug: true }).strict())
				.output(z.object({ startedAt: z.date().optional() }))
				.query(async ({ ctx, input }) => {
					const startedAt = await this.meetingService.getCurrentMeetingStart(ctx.bouncer, input);
					return { startedAt };
				}),
			currentMeetingStartSubscription: authedProcedure
				.input(TeamSchema.pick({ slug: true }).strict())
				.subscription(({ ctx, input }): Promise<Observable<Date | undefined, unknown>> => {
					return this.meetingSubscriptionService.currentMeetingStartSubscribe(ctx.bouncer, input);
				}),

			deleteOngoingMeeting: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }) }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.meetingService.deleteOngoingMeeting(ctx.bouncer, input.team);
				}),
			deleteFinishedMeeting: authedProcedure
				.input(
					z
						.object({
							team: TeamSchema.pick({ slug: true }),
							meeting: z.object({ startedAt: z.date(), endedAt: z.date() }),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.meetingService.deleteFinishedMeeting(ctx.bouncer, input.team, {
						start: input.meeting.startedAt,
						end: input.meeting.endedAt,
					});
				}),
		});
	}
}
