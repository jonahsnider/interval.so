import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TimeRangeSchema } from './schemas/time_range_schema.js';

export class TeamStatsService {
	async getCombinedHours(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		_timeRange: TimeRangeSchema,
	): Promise<number> {
		assert(await bouncer.with('TeamPolicy').allows('read', team), new TRPCError({ code: 'FORBIDDEN' }));

		// The sum of all meeting hours logged between the start and end date
		// Should also include any pending sign in times (acting as though they were signed out now)

		// TODO: Implement
		return Math.round(Math.random() * 100);
	}
}
