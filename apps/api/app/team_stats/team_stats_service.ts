import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { convert } from 'convert';
import { and, eq, gt, lt, sql, sum } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TimeRangeSchema } from './schemas/time_range_schema.js';

export class TeamStatsService {
	async getCombinedHours(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		timeRange: TimeRangeSchema,
	): Promise<number> {
		assert(await bouncer.with('TeamPolicy').allows('read', team), new TRPCError({ code: 'FORBIDDEN' }));

		// TODO: Include pending meetings in this stat by acting as though they had just ended now

		const teamMembersForTeam = db
			.select({ id: Schema.teamMembers.id })
			.from(Schema.teamMembers)
			.where(eq(Schema.teamMembers.teamSlug, team.slug))
			.as('team_members_for_team');

		const [result] = await db
			.select({
				durationSeconds: sum(
					sql`EXTRACT(epoch FROM ${Schema.finishedMemberMeetings.endedAt} - ${Schema.finishedMemberMeetings.startedAt})`,
				),
			})
			.from(Schema.finishedMemberMeetings)
			.innerJoin(teamMembersForTeam, eq(Schema.finishedMemberMeetings.memberId, teamMembersForTeam.id))
			.where(
				and(
					gt(Schema.finishedMemberMeetings.startedAt, timeRange.start),
					lt(Schema.finishedMemberMeetings.endedAt, timeRange.end),
					eq(Schema.finishedMemberMeetings.memberId, teamMembersForTeam.id),
				),
			);

		if (!result?.durationSeconds) {
			return 0;
		}

		return convert(Number(result.durationSeconds), 'seconds').to('hours');
	}
}
