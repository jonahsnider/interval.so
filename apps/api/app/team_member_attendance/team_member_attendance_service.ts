import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, count, eq, gt, inArray, lt, max, min, not, sql } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { injectHelper } from '../../util/inject_helper.ts';
import { ph } from '../analytics/analytics_service.ts';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.ts';
import { db } from '../db/db_service.ts';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.ts';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.ts';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.ts';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.ts';
import type { AttendanceEntrySchema } from './schemas/attendance_entry_schema.ts';
import { type Actor, assertTeamRoleForAttendance, assertTeamRoleForMembers } from '../authorization/authorization.ts';

@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMemberAttendanceService {
	constructor(private readonly eventsService: TeamMemberEventsService) {}

	async deleteEntries(actor: Actor, attendanceEntries: Pick<AttendanceEntrySchema, 'attendanceId'>[]): Promise<void> {
		await assertTeamRoleForAttendance(actor, attendanceEntries, 'editor');

		const attendanceIds = attendanceEntries.map((entry) => entry.attendanceId);

		const affectedMembers: Pick<TeamMemberSchema, 'id'>[] = await db
			.delete(Schema.memberAttendance)
			.where(inArray(Schema.memberAttendance.memberAttendanceId, attendanceIds))
			.returning({
				id: Schema.memberAttendance.memberId,
			});

		const affectedTeams = await this.eventsService.announceEvent(
			affectedMembers,
			MemberRedisEvent.MemberAttendanceUpdated,
		);

		if (actor?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: actor.id,
					// Kinda scuffed since this method is used for both batch and single deletes
					event:
						attendanceIds.length > 1
							? AnalyticsEvent.TeamMemberAttendanceBatchDeleted
							: AnalyticsEvent.TeamMemberAttendanceDeleted,
					groups: {
						company: affectedTeam.id,
					},
				});
			}
		}
	}

	async createEntry(
		actor: Actor,
		member: Pick<TeamMemberSchema, 'id'>,
		data: Pick<AttendanceEntrySchema, 'startedAt' | 'endedAt'>,
	): Promise<void> {
		await assertTeamRoleForMembers(actor, [member], 'editor');

		const [overlappingEntries] = await db
			.select({
				count: count(),
			})
			.from(Schema.memberAttendance)
			.where(
				and(
					eq(Schema.memberAttendance.memberId, member.id),
					sql`tstzrange(${Schema.memberAttendance.startedAt}, ${Schema.memberAttendance.endedAt}, '[]') && tstzrange(${data.startedAt.toISOString()}, ${data.endedAt.toISOString()}, '[]')`,
				),
			);

		assert(overlappingEntries);
		assert(
			overlappingEntries.count === 0,
			new TRPCError({ code: 'UNPROCESSABLE_CONTENT', message: 'This attendance entry overlaps with an existing one' }),
		);

		await db.insert(Schema.memberAttendance).values({
			startedAt: data.startedAt,
			endedAt: data.endedAt,
			memberId: member.id,
		});

		const [affectedTeam] = await this.eventsService.announceEvent([member], MemberRedisEvent.MemberAttendanceUpdated);

		if (actor?.id && affectedTeam) {
			ph.capture({
				distinctId: actor.id,
				event: AnalyticsEvent.TeamMemberAttendanceCreated,
				groups: {
					company: affectedTeam.id,
				},
			});
		}
	}

	async mergeEntries(actor: Actor, data: Pick<AttendanceEntrySchema, 'attendanceId'>[]): Promise<void> {
		await assertTeamRoleForAttendance(actor, data, 'editor');

		// Get the earliest start time and the latest end time, delete all the the specified meetings, then insert a new one

		const updatedMember: Pick<TeamMemberSchema, 'id'> = await db.transaction(async (tx) => {
			const attendanceIds = data.map((entry) => entry.attendanceId);

			const [result] = await tx
				.select({
					startedAt: min(Schema.memberAttendance.startedAt),
					endedAt: max(Schema.memberAttendance.endedAt),
					memberId: Schema.memberAttendance.memberId,
				})
				.from(Schema.memberAttendance)
				.limit(1)
				.groupBy(Schema.memberAttendance.memberId)
				.where(inArray(Schema.memberAttendance.memberAttendanceId, attendanceIds));

			await tx
				.delete(Schema.memberAttendance)
				.where(inArray(Schema.memberAttendance.memberAttendanceId, attendanceIds));

			assert(
				result?.startedAt && result.endedAt,
				new TRPCError({ code: 'NOT_FOUND', message: 'Attendance entries not found' }),
			);

			const [overlappingEntries] = await tx
				.select({
					count: count(),
				})
				.from(Schema.memberAttendance)
				.where(
					and(
						eq(Schema.memberAttendance.memberId, result.memberId),
						sql`tstzrange(${Schema.memberAttendance.startedAt}, ${Schema.memberAttendance.endedAt}, '[]') && tstzrange(${result.startedAt.toISOString()}, ${result.endedAt.toISOString()}, '[]')`,
					),
				);

			assert(overlappingEntries);
			assert(
				overlappingEntries.count === 0,
				new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'The merged attendance entry would overlap with an existing one',
				}),
			);

			await tx.insert(Schema.memberAttendance).values({
				startedAt: result.startedAt,
				endedAt: result.endedAt,
				memberId: result.memberId,
			});

			return { id: result.memberId };
		});

		const [affectedTeam] = await this.eventsService.announceEvent(
			[updatedMember],
			MemberRedisEvent.MemberAttendanceUpdated,
		);

		if (actor?.id && affectedTeam) {
			ph.capture({
				distinctId: actor.id,
				event: AnalyticsEvent.TeamMemberAttendanceMerged,
				groups: {
					company: affectedTeam.id,
				},
			});
		}
	}

	async getEntriesForMember(
		actor: Actor,
		member: Pick<TeamMemberSchema, 'id'>,
		timeFilter: TimeFilterSchema,
	): Promise<Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[]> {
		await assertTeamRoleForMembers(actor, [member], 'editor');

		const result = await db
			.select({
				attendanceId: Schema.memberAttendance.memberAttendanceId,
				startedAt: Schema.memberAttendance.startedAt,
				endedAt: Schema.memberAttendance.endedAt,
			})
			.from(Schema.memberAttendance)
			.where(
				and(
					eq(Schema.memberAttendance.memberId, member.id),
					gt(Schema.memberAttendance.startedAt, timeFilter.start),
					timeFilter.end && lt(Schema.memberAttendance.endedAt, timeFilter.end),
				),
			);

		return result.map((row) => ({
			attendanceId: row.attendanceId,
			startedAt: row.startedAt,
			endedAt: row.endedAt,
		}));
	}

	async updateEntry(
		actor: Actor,
		update: Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>,
	): Promise<void> {
		await assertTeamRoleForAttendance(actor, [update], 'editor');

		if (update.endedAt.getTime() < update.startedAt.getTime()) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: 'Cannot end meeting before it starts',
			});
		}

		const existingEntry = db
			.select({
				memberId: Schema.memberAttendance.memberId,
			})
			.from(Schema.memberAttendance)
			.where(eq(Schema.memberAttendance.memberAttendanceId, update.attendanceId));

		const [overlappingEntries] = await db
			.select({
				count: count(),
			})
			.from(Schema.memberAttendance)
			.where(
				and(
					eq(Schema.memberAttendance.memberId, existingEntry),
					not(eq(Schema.memberAttendance.memberAttendanceId, update.attendanceId)),
					sql`tstzrange(${Schema.memberAttendance.startedAt}, ${Schema.memberAttendance.endedAt}, '[]') && tstzrange(${update.startedAt.toISOString()}, ${update.endedAt.toISOString()}, '[]')`,
				),
			);

		assert(overlappingEntries);
		assert(
			overlappingEntries.count === 0,
			new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: 'The updated attendance entry would overlap with an existing one',
			}),
		);

		const members: Pick<TeamMemberSchema, 'id'>[] = await db
			.update(Schema.memberAttendance)
			.set({
				startedAt: update.startedAt,
				endedAt: update.endedAt,
			})
			.where(eq(Schema.memberAttendance.memberAttendanceId, update.attendanceId))
			.returning({
				id: Schema.memberAttendance.memberId,
			});

		const affectedTeams = await this.eventsService.announceEvent(members, MemberRedisEvent.MemberAttendanceUpdated);

		if (actor?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: actor.id,
					event: AnalyticsEvent.TeamMemberAttendanceUpdated,
					groups: {
						company: affectedTeam.id,
					},
				});
			}
		}
	}
}
