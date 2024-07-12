import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import { AttendanceEntrySchema } from '../team_member_attendance/schemas/attendance_entry_schema.js';
import { TeamMemberAttendanceService } from '../team_member_attendance/team_member_attendance_service.js';
import { TeamMemberAttendanceSubscriptionService } from '../team_member_attendance/team_member_attendance_subscription_service.js';
import { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamMemberAttendanceService, TeamMemberAttendanceSubscriptionService)
export class TeamMemberAttendanceRouter {
	constructor(
		private readonly attendanceService: TeamMemberAttendanceService,
		private readonly attendanceSubscriptionService: TeamMemberAttendanceSubscriptionService,
	) {}

	getRouter() {
		return router({
			getEntriesForMember: authedProcedure
				.input(z.object({ member: TeamMemberSchema.pick({ id: true }), timeFilter: TimeFilterSchema }).strict())
				.output(AttendanceEntrySchema.pick({ attendanceId: true, startedAt: true, endedAt: true }).array())
				.query(({ ctx, input }) =>
					this.attendanceService.getEntriesForMember(ctx.bouncer, input.member, input.timeFilter),
				),
			entriesForMemberSubscription: authedProcedure
				.input(z.object({ member: TeamMemberSchema.pick({ id: true }), timeFilter: TimeFilterSchema }).strict())
				.subscription(
					({
						ctx,
						input,
					}): Promise<Observable<Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[], unknown>> => {
						return this.attendanceSubscriptionService.entriesForMemberSubscribe(
							ctx.bouncer,
							input.member,
							input.timeFilter,
						);
					},
				),

			createEntry: authedProcedure
				.input(
					z.object({
						member: TeamMemberSchema.pick({ id: true }),
						data: AttendanceEntrySchema.pick({ startedAt: true, endedAt: true }).strict(),
					}),
				)
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.attendanceService.createEntry(ctx.bouncer, input.member, input.data);
				}),

			deleteEntries: authedProcedure
				.input(AttendanceEntrySchema.pick({ attendanceId: true }).array())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.attendanceService.deleteEntries(ctx.bouncer, input);
				}),

			updateEntry: authedProcedure
				.input(AttendanceEntrySchema.pick({ attendanceId: true, startedAt: true, endedAt: true }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.attendanceService.updateEntry(ctx.bouncer, input);
				}),

			mergeEntries: authedProcedure
				.input(z.array(AttendanceEntrySchema.pick({ attendanceId: true })).min(2))
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.attendanceService.mergeEntries(ctx.bouncer, input);
				}),
		});
	}
}
