import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, count, eq, gt, inArray, lt, max, min, sql } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import { MemberRedisEvent } from '../team_member/events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from '../team_member/events/team_member_events_service.js';
import type { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import type { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import type { AttendanceEntrySchema } from './schemas/attendance_entry_schema.js';

@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMemberAttendanceService {
	constructor(private readonly eventsService: TeamMemberEventsService) {}

	async deleteEntries(
		bouncer: AppBouncer,
		attendanceEntries: Pick<AttendanceEntrySchema, 'attendanceId'>[],
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('deleteEntries', attendanceEntries),
		);

		const attendanceIds = attendanceEntries.map((entry) => entry.attendanceId);

		const affectedMembers = await db
			.delete(Schema.memberAttendance)
			.where(inArray(Schema.memberAttendance.id, attendanceIds))
			.returning({
				id: Schema.memberAttendance.memberId,
			});

		await this.eventsService.announceEvent(affectedMembers, MemberRedisEvent.MemberAttendanceUpdated);
	}

	async createEntry(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		data: Pick<AttendanceEntrySchema, 'startedAt' | 'endedAt'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('createEntryForMembers', [member]),
		);

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

		await this.eventsService.announceEvent([member], MemberRedisEvent.MemberAttendanceUpdated);
	}

	async mergeEntries(bouncer: AppBouncer, data: Pick<AttendanceEntrySchema, 'attendanceId'>[]): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('mergeEntries', data),
		);

		// Get the earliest start time and the latest end time, delete all the the specified meetings, then insert a new one

		const updatedMember = await db.transaction(async (tx) => {
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
				.where(inArray(Schema.memberAttendance.id, attendanceIds));

			await tx.delete(Schema.memberAttendance).where(inArray(Schema.memberAttendance.id, attendanceIds));

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

		await this.eventsService.announceEvent([updatedMember], MemberRedisEvent.MemberAttendanceUpdated);
	}

	async getEntriesForMember(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
		timeFilter: TimeFilterSchema,
	): Promise<Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[]> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('viewEntriesForMembers', [member]),
		);

		const result = await db
			.select({
				attendanceId: Schema.memberAttendance.id,
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
		bouncer: AppBouncer,
		update: Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberAttendancePolicy').allows('updateEntries', [update]),
		);

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
			.where(eq(Schema.memberAttendance.id, update.attendanceId))
			.as('existing_entry');

		const [overlappingEntries] = await db
			.select({
				count: count(),
			})
			.from(Schema.memberAttendance)
			.where(
				and(
					eq(Schema.memberAttendance.memberId, existingEntry.memberId),
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
			.where(eq(Schema.memberAttendance.id, update.attendanceId))
			.returning({
				id: Schema.memberAttendance.memberId,
			});

		await this.eventsService.announceEvent(members, MemberRedisEvent.MemberAttendanceUpdated);
	}
}
