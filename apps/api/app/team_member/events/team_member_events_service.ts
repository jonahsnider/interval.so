import redis from '@adonisjs/redis/services/main';
import { eq, inArray } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../../db/db_service.js';
import type { TeamSchema } from '../../team/schemas/team_schema.js';
import type { TeamMemberSchema } from '../schemas/team_member_schema.js';
import type { RedisEvent } from './schemas/redis_event_schema.js';

export class TeamMemberEventsService {
	private static async announceEventRaw(team: Pick<TeamSchema, 'id'>, event: RedisEvent): Promise<void> {
		await redis.publish(`team/${team.id}/members`, event);
	}

	private static async announceEventByMembers(
		members: Pick<TeamMemberSchema, 'id'>[],
		event: RedisEvent,
	): Promise<void> {
		if (members.length === 0) {
			return;
		}

		const teams = await db
			.select({
				id: Schema.teamMembers.teamId,
			})
			.from(Schema.teamMembers)
			.where(
				inArray(
					Schema.teamMembers.id,
					members.map((member) => member.id),
				),
			)
			.groupBy(Schema.teamMembers.teamId);

		await Promise.all(teams.map((team) => TeamMemberEventsService.announceEventRaw(team, event)));
	}

	private static async announceEventByTeam(
		team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>,
		event: RedisEvent,
	): Promise<void> {
		if ('id' in team) {
			return TeamMemberEventsService.announceEventRaw(team, event);
		}

		const teamWithId = await db.query.teams.findFirst({
			columns: {
				id: true,
			},
			where: eq(Schema.teams.slug, team.slug),
		});

		if (!teamWithId) {
			throw new Error(`Team with slug ${team.slug} not found`);
		}

		return TeamMemberEventsService.announceEventRaw(teamWithId, event);
	}

	static announceEvent(members: Pick<TeamMemberSchema, 'id'>[], event: RedisEvent): Promise<void>;
	static announceEvent(team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>, event: RedisEvent): Promise<void>;
	static announceEvent(
		teamOrMembers: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'> | Pick<TeamMemberSchema, 'id'>[],
		event: RedisEvent,
	): Promise<void> {
		if (Array.isArray(teamOrMembers)) {
			return TeamMemberEventsService.announceEventByMembers(teamOrMembers, event);
		}

		return TeamMemberEventsService.announceEventByTeam(teamOrMembers, event);
	}
}
