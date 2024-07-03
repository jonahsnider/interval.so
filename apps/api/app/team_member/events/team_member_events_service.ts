import { inject } from '@adonisjs/core';
import redis from '@adonisjs/redis/services/main';
import { inArray } from 'drizzle-orm';
import { type Observable, from, map, mergeMap } from 'rxjs';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../../util/inject_helper.js';
import { AuthorizationService } from '../../authorization/authorization_service.js';
import { db } from '../../db/db_service.js';
import { MultiSubscriptionManager } from '../../redis/multi_subscription_manager.js';
import type { TeamSchema } from '../../team/schemas/team_schema.js';
import { TeamService } from '../../team/team_service.js';
import type { TeamMemberSchema } from '../schemas/team_member_schema.js';
import type { RedisEvent } from './schemas/redis_event_schema.js';

@inject()
@injectHelper(TeamService)
export class TeamMemberEventsService {
	private static getRedisChannel(team: Pick<TeamSchema, 'id'>): string {
		return `team/${team.id}/members`;
	}

	private static async announceEventRaw(team: Pick<TeamSchema, 'id'>, event: RedisEvent): Promise<void> {
		await redis.publish(TeamMemberEventsService.getRedisChannel(team), event);
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

	constructor(private readonly teamService: TeamService) {}

	async subscribeForTeam(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<Observable<RedisEvent>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));

		const teamWithId = await this.teamService.getTeamBySlug(team);

		return MultiSubscriptionManager.subscribe<RedisEvent>(TeamMemberEventsService.getRedisChannel(teamWithId)).pipe(
			mergeMap((message) =>
				// Ensure that they still have access to this data
				from(
					AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team)),
				).pipe(
					map((_) => {
						return message;
					}),
				),
			),
		);
	}

	private async announceEventByTeam(
		team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>,
		event: RedisEvent,
	): Promise<void> {
		if ('id' in team) {
			return TeamMemberEventsService.announceEventRaw(team, event);
		}

		const teamWithId = await this.teamService.getTeamBySlug(team);

		if (!teamWithId) {
			throw new Error(`Team with slug ${team.slug} not found`);
		}

		return TeamMemberEventsService.announceEventRaw(teamWithId, event);
	}

	announceEvent(members: Pick<TeamMemberSchema, 'id'>[], event: RedisEvent): Promise<void>;
	announceEvent(team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>, event: RedisEvent): Promise<void>;
	announceEvent(
		teamOrMembers: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'> | Pick<TeamMemberSchema, 'id'>[],
		event: RedisEvent,
	): Promise<void> {
		if (Array.isArray(teamOrMembers)) {
			return TeamMemberEventsService.announceEventByMembers(teamOrMembers, event);
		}

		return this.announceEventByTeam(teamOrMembers, event);
	}
}
