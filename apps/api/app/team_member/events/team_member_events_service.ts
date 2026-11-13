import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import redis from '@adonisjs/redis/services/main';
import { TRPCError } from '@trpc/server';
import { inArray } from 'drizzle-orm';
import { from, map, mergeMap, type Observable } from 'rxjs';
import * as Schema from '#database/schema';
import { injectHelper } from '../../../util/inject_helper.ts';
import { db } from '../../db/db_service.ts';
import { MultiSubscriptionManager } from '../../redis/multi_subscription_manager.ts';
import type { TeamSchema } from '../../team/schemas/team_schema.ts';
import { TeamService } from '../../team/team_service.ts';
import type { TeamMemberSchema } from '../schemas/team_member_schema.ts';
import type { MemberRedisEvent } from './schemas/redis_event_schema.ts';
import { type Actor, assertTeamRole, assertTeamRoleForMembers } from '../../authorization/authorization.ts';

@inject()
@injectHelper(TeamService)
export class TeamMemberEventsService {
	private static getRedisChannel(team: Pick<TeamSchema, 'id'>): string {
		return `team/${team.id}/members`;
	}

	private static async announceEventRaw(team: Pick<TeamSchema, 'id'>, event: MemberRedisEvent): Promise<void> {
		await redis.publish(TeamMemberEventsService.getRedisChannel(team), event);
	}

	private static async announceEventByMembers(
		members: Pick<TeamMemberSchema, 'id'>[],
		event: MemberRedisEvent,
	): Promise<Pick<TeamSchema, 'id'>[]> {
		if (members.length === 0) {
			return [];
		}

		const teams: Pick<TeamSchema, 'id'>[] = await db
			.select({
				id: Schema.teamMembers.teamId,
			})
			.from(Schema.teamMembers)
			.where(
				inArray(
					Schema.teamMembers.memberId,
					members.map((member) => member.id),
				),
			)
			.groupBy(Schema.teamMembers.teamId);

		if (teams.length === 0) {
			logger.warn(
				'Tried to announce a team member event by members, but no teams could be found from the members. Were the members deleted? - %o',
				{
					members,
					teams,
					event,
				},
			);

			return [];
		}

		await Promise.all(teams.map((team) => TeamMemberEventsService.announceEventRaw(team, event)));

		return teams;
	}

	constructor(private readonly teamService: TeamService) {}

	async subscribeForTeam(
		actor: Actor,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
	): Promise<Observable<MemberRedisEvent>> {
		await assertTeamRole(actor, team, 'guest');

		const teamWithId = 'id' in team ? team : await this.teamService.getTeamBySlug(team);

		return MultiSubscriptionManager.subscribe<MemberRedisEvent>(
			TeamMemberEventsService.getRedisChannel(teamWithId),
		).pipe(
			mergeMap((message) =>
				// Ensure that they still have access to this data
				from(assertTeamRole(actor, team, 'guest')).pipe(
					map((_) => {
						return message;
					}),
				),
			),
		);
	}

	async subscribeForTeamByMember(
		actor: Actor,
		member: Pick<TeamMemberSchema, 'id'>,
	): Promise<Observable<MemberRedisEvent>> {
		await assertTeamRoleForMembers(actor, [member], 'editor');

		const team = await db.query.teamMembers.findFirst({
			columns: {
				teamId: true,
			},
			where: { memberId: member.id },
		});

		if (!team) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Member not found',
			});
		}

		return this.subscribeForTeam(actor, { id: team.teamId });
	}

	private async announceEventByTeam(
		team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>,
		event: MemberRedisEvent,
	): Promise<Pick<TeamSchema, 'id'>> {
		if ('id' in team) {
			await TeamMemberEventsService.announceEventRaw(team, event);

			return team;
		}

		const teamWithId = await this.teamService.getTeamBySlug(team);

		if (!teamWithId) {
			throw new Error(`Team with slug ${team.slug} not found`);
		}

		await TeamMemberEventsService.announceEventRaw(teamWithId, event);

		return teamWithId;
	}

	announceEvent(members: Pick<TeamMemberSchema, 'id'>[], event: MemberRedisEvent): Promise<Pick<TeamSchema, 'id'>[]>;
	announceEvent(
		team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>,
		event: MemberRedisEvent,
	): Promise<Pick<TeamSchema, 'id'>>;
	announceEvent(
		teamOrMembers: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'> | Pick<TeamMemberSchema, 'id'>[],
		event: MemberRedisEvent,
	): Promise<Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'id'>[]> {
		if (Array.isArray(teamOrMembers)) {
			return TeamMemberEventsService.announceEventByMembers(teamOrMembers, event);
		}

		return this.announceEventByTeam(teamOrMembers, event);
	}
}
