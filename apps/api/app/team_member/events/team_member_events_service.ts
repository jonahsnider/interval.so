import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import redis from '@adonisjs/redis/services/main';
import { TRPCError } from '@trpc/server';
import { eq, inArray } from 'drizzle-orm';
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
import type { MemberRedisEvent } from './schemas/redis_event_schema.js';

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

		if (teams.length === 0) {
			logger.warn(
				'Tried to announce a team member event by members, but no teams could be found from the members. Were the members deleted? - %o',
				{
					members,
					teams,
					event,
				},
			);

			return;
		}

		await Promise.all(teams.map((team) => TeamMemberEventsService.announceEventRaw(team, event)));
	}

	constructor(private readonly teamService: TeamService) {}

	async subscribeForTeam(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'id'>,
	): Promise<Observable<MemberRedisEvent>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));

		const teamWithId = 'id' in team ? team : await this.teamService.getTeamBySlug(team);

		return MultiSubscriptionManager.subscribe<MemberRedisEvent>(
			TeamMemberEventsService.getRedisChannel(teamWithId),
		).pipe(
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

	async subscribeForTeamByMember(
		bouncer: AppBouncer,
		member: Pick<TeamMemberSchema, 'id'>,
	): Promise<Observable<MemberRedisEvent>> {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('viewMeetingsForMembers', [member]),
		);

		const team = await db.query.teamMembers.findFirst({
			columns: {
				teamId: true,
			},
			where: eq(Schema.teamMembers.id, member.id),
		});

		if (!team) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Member not found',
			});
		}

		return this.subscribeForTeam(bouncer, { id: team.teamId });
	}

	private async announceEventByTeam(
		team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>,
		event: MemberRedisEvent,
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

	announceEvent(members: Pick<TeamMemberSchema, 'id'>[], event: MemberRedisEvent): Promise<void>;
	announceEvent(team: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'>, event: MemberRedisEvent): Promise<void>;
	announceEvent(
		teamOrMembers: Pick<TeamSchema, 'id'> | Pick<TeamSchema, 'slug'> | Pick<TeamMemberSchema, 'id'>[],
		event: MemberRedisEvent,
	): Promise<void> {
		if (Array.isArray(teamOrMembers)) {
			return TeamMemberEventsService.announceEventByMembers(teamOrMembers, event);
		}

		return this.announceEventByTeam(teamOrMembers, event);
	}
}
