import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { MeetingAttendeeSchema } from '../meeting/schemas/team_meeting_schema.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import { NowOrEarlierSchema } from '../team_member/schemas/now_or_earlier_schema.js';
import { type SimpleTeamMemberSchema, TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import { TeamMemberBatchService } from '../team_member/team_member_batch_service.js';
import { TeamMemberService } from '../team_member/team_member_service.js';
import { TeamMemberSubscriptionService } from '../team_member/team_member_subscription_service.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamMemberService, TeamMemberEventsService, TeamMemberSubscriptionService, TeamMemberBatchService)
export class TeamMemberRouter {
	constructor(
		private readonly teamMemberService: TeamMemberService,
		private readonly teamMemberSubscriptionService: TeamMemberSubscriptionService,
		private readonly teamMemberBatchService: TeamMemberBatchService,
	) {}

	getRouter() {
		return router({
			create: publicProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }).strict(),
						member: TeamMemberSchema.pick({ name: true }).strict(),
					}),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamMemberService.create(ctx.bouncer, input.team, input.member);
				}),

			simpleMemberList: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamMemberSchema.pick({ id: true, name: true, atMeeting: true }).array())
				.query(({ ctx, input }) => {
					return this.teamMemberService.getTeamMembersSimple(ctx.bouncer, input);
				}),

			simpleMemberListSubscription: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.subscription(({ ctx, input }): Promise<Observable<SimpleTeamMemberSchema[], unknown>> => {
					return this.teamMemberSubscriptionService.simpleTeamMemberListSubscribe(ctx.bouncer, input);
				}),
			updateAttendance: publicProcedure
				.input(TeamMemberSchema.pick({ id: true, atMeeting: true }).strict())
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamMemberService.updateAttendance(ctx.bouncer, input, input);
				}),

			endMeeting: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), endTime: NowOrEarlierSchema }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.signOutAll(ctx.bouncer, input.team, input.endTime);
				}),

			fullMemberList: authedProcedure
				.input(TeamSchema.pick({ slug: true }).strict())
				.output(TeamMemberSchema.array())
				.query(({ ctx, input }) => {
					return this.teamMemberService.getTeamMembersFull(ctx.bouncer, input);
				}),
			fullMemberListSubscription: authedProcedure
				.input(TeamSchema.pick({ slug: true }).strict())
				.subscription(({ ctx, input }): Promise<Observable<TeamMemberSchema[], unknown>> => {
					return this.teamMemberSubscriptionService.fullTeamMemberListSubscribe(ctx.bouncer, input);
				}),

			setArchived: authedProcedure
				.input(TeamMemberSchema.pick({ id: true, archived: true }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberService.setArchived(ctx.bouncer, input);
				}),

			delete: authedProcedure
				.input(TeamMemberSchema.pick({ id: true }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberService.delete(ctx.bouncer, input);
				}),

			deleteMany: authedProcedure
				.input(
					z
						.object({
							members: TeamMemberSchema.pick({ id: true }).array().min(1),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.deleteMany(ctx.bouncer, input.members);
				}),
			setArchivedMany: authedProcedure
				.input(
					z
						.object({
							members: TeamMemberSchema.pick({ id: true }).array().min(1),
							data: TeamMemberSchema.pick({ archived: true }).strict(),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.setArchivedMany(ctx.bouncer, input.members, input.data);
				}),
			updateAttendanceMany: authedProcedure
				.input(
					z
						.object({
							members: TeamMemberSchema.pick({ id: true }).array().min(1),
							data: TeamMemberSchema.pick({ atMeeting: true }).strict(),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.updateAttendanceMany(ctx.bouncer, input.members, input.data);
				}),

			deleteFinishedMeeting: authedProcedure
				.input(MeetingAttendeeSchema.pick({ attendanceId: true }))
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberService.deleteFinishedMeeting(ctx.bouncer, input);
				}),
			updateFinishedMeetings: authedProcedure
				.input(z.array(MeetingAttendeeSchema.pick({ attendanceId: true, startedAt: true, endedAt: true }).strict()))
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.updateManyMeetings(ctx.bouncer, input);
				}),
		});
	}
}
