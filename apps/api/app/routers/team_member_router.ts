import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.ts';
import { TeamSchema } from '../team/schemas/team_schema.ts';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.ts';
import { NowOrEarlierSchema } from '../team_member/schemas/now_or_earlier_schema.ts';
import { type SimpleTeamMemberSchema, TeamMemberSchema } from '../team_member/schemas/team_member_schema.ts';
import { TeamMemberBatchService } from '../team_member/team_member_batch_service.ts';
import { TeamMemberService } from '../team_member/team_member_service.ts';
import { TeamMemberSubscriptionService } from '../team_member/team_member_subscription_service.ts';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.ts';
import { TeamMemberAttendanceRouter } from './team_member_attendance_router.ts';

@inject()
@injectHelper(
	TeamMemberService,
	TeamMemberEventsService,
	TeamMemberSubscriptionService,
	TeamMemberBatchService,
	TeamMemberAttendanceRouter,
)
export class TeamMemberRouter {
	constructor(
		private readonly teamMemberService: TeamMemberService,
		private readonly teamMemberSubscriptionService: TeamMemberSubscriptionService,
		private readonly teamMemberBatchService: TeamMemberBatchService,
		private readonly attendanceRouter: TeamMemberAttendanceRouter,
	) {}

	getRouter() {
		return router({
			attendance: this.attendanceRouter.getRouter(),

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
				.output(TeamMemberSchema.pick({ id: true, name: true, signedInAt: true }).array())
				.query(({ ctx, input }) => {
					return this.teamMemberService.getTeamMembersSimple(ctx.bouncer, input);
				}),

			simpleMemberListSubscription: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.subscription(({ ctx, input }): Promise<Observable<SimpleTeamMemberSchema[], unknown>> => {
					return this.teamMemberSubscriptionService.simpleTeamMemberListSubscribe(ctx.bouncer, input);
				}),
			updateAttendance: publicProcedure
				.input(
					z.object({
						member: TeamMemberSchema.pick({ id: true }),
						data: z.object({ atMeeting: z.boolean() }),
					}),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamMemberService.updateAttendance(ctx.bouncer, input.member, input.data);
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

			getMember: authedProcedure
				.input(TeamMemberSchema.pick({ id: true }).strict())
				.output(TeamMemberSchema.pick({ name: true, archived: true, signedInAt: true }))
				.query(({ ctx, input }) => {
					return this.teamMemberService.getMember(ctx.bouncer, input);
				}),
			getMemberSubscription: authedProcedure
				.input(TeamMemberSchema.pick({ id: true }).strict())
				.subscription(
					({
						ctx,
						input,
					}): Promise<Observable<Pick<TeamMemberSchema, 'archived' | 'signedInAt' | 'name'>, unknown>> => {
						return this.teamMemberSubscriptionService.getMemberSubscription(ctx.bouncer, input);
					},
				),

			setName: authedProcedure
				.input(TeamMemberSchema.pick({ id: true, name: true }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberService.setName(ctx.bouncer, input, input);
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
							data: z.object({ atMeeting: z.boolean() }).strict(),
						})
						.strict(),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberBatchService.updateAttendanceMany(ctx.bouncer, input.members, input.data);
				}),
		});
	}
}
