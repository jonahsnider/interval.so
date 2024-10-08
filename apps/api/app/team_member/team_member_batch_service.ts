import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray, isNotNull, isNull, lte } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { ph } from '../analytics/analytics_service.js';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { MemberRedisEvent } from './events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from './events/team_member_events_service.js';
import type { TeamMemberSchema } from './schemas/team_member_schema.js';

@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMemberBatchService {
	constructor(private readonly eventsService: TeamMemberEventsService) {}

	async signOutAll(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, endTime: Date): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('signOutAll', team));

		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			// Select members who are signed in and should be signed out
			const members = await tx
				.select({
					memberId: Schema.teamMembers.memberId,
					pendingSignIn: Schema.teamMembers.pendingSignIn,
				})
				.from(Schema.teamMembers)
				.innerJoin(
					Schema.teams,
					and(
						eq(Schema.teamMembers.teamId, Schema.teams.teamId),
						eq(Schema.teams.slug, team.slug),
						isNotNull(Schema.teamMembers.pendingSignIn),
						// Make sure we only affect people who had signed in **before** the end time
						lte(Schema.teamMembers.pendingSignIn, endTime),
					),
				);

			if (members.length === 0) {
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'There is no meeting in progress',
				});
			}

			await tx.insert(Schema.memberAttendance).values(
				members.map((member) => {
					const { pendingSignIn } = member;

					assert(pendingSignIn, new TypeError('Expected pending sign in to be defined'));
					assert(
						pendingSignIn.getTime() <= endTime.getTime(),
						new TRPCError({ code: 'UNPROCESSABLE_CONTENT', message: 'Cannot end meeting before it starts' }),
					);

					return {
						memberId: member.memberId,
						startedAt: pendingSignIn,
						endedAt: endTime,
					};
				}),
			);

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(
					inArray(
						Schema.teamMembers.memberId,
						members.map((member) => member.memberId),
					),
				);
		});

		const affectedTeam = await this.eventsService.announceEvent(team, MemberRedisEvent.MemberAttendanceUpdated);

		if (bouncer.user?.id) {
			ph.capture({
				distinctId: bouncer.user.id,
				event: AnalyticsEvent.MeetingEnded,
				groups: {
					company: affectedTeam.id,
				},
			});
		}
	}

	async deleteMany(bouncer: AppBouncer, members: Pick<TeamMemberSchema, 'id'>[]) {
		if (members.length === 0) {
			return;
		}

		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('delete', members));

		let teams: Pick<TeamSchema, 'id'>[] = [];

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Delete meetings
			await tx.delete(Schema.memberAttendance).where(inArray(Schema.memberAttendance.memberId, memberIds));
			// Delete member
			teams = await tx.delete(Schema.teamMembers).where(inArray(Schema.teamMembers.memberId, memberIds)).returning({
				id: Schema.teamMembers.teamId,
			});
		});

		const teamIds = new Set(teams.map((team) => team.id));

		const affectedTeams = await Promise.all(
			Array.from(teamIds).map((teamId) =>
				this.eventsService.announceEvent({ id: teamId }, MemberRedisEvent.MemberDeleted),
			),
		);

		if (bouncer.user?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: bouncer.user.id,
					event: AnalyticsEvent.TeamMembersBatchDeleted,
					groups: {
						company: affectedTeam.id,
					},
				});
			}
		}
	}

	async setArchivedMany(
		bouncer: AppBouncer,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: Pick<TeamMemberSchema, 'archived'>,
	) {
		if (members.length === 0) {
			return;
		}

		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', members));

		const memberIds = members.map((member) => member.id);

		if (data.archived) {
			const dbMembers = await db.query.teamMembers.findMany({
				columns: {
					pendingSignIn: true,
				},
				where: inArray(Schema.teamMembers.memberId, memberIds),
			});

			if (dbMembers.some((member) => member.pendingSignIn)) {
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'Cannot archive a member who is currently signed in',
				});
			}
		}

		await db
			.update(Schema.teamMembers)
			.set({ archived: data.archived, pendingSignIn: null })
			.where(inArray(Schema.teamMembers.memberId, memberIds));

		const affectedTeams = await this.eventsService.announceEvent(members, MemberRedisEvent.MemberUpdated);

		if (bouncer.user?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: bouncer.user.id,
					event: AnalyticsEvent.TeamMembersBatchArchivedUpdated,
					groups: {
						company: affectedTeam.id,
					},
					properties: {
						archived: data.archived,
					},
				});
			}
		}
	}

	async updateAttendanceMany(
		bouncer: AppBouncer,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: { atMeeting: boolean },
	): Promise<void> {
		if (members.length === 0) {
			return;
		}

		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', members));

		if (data.atMeeting) {
			await this.signInMany(bouncer, members);
		} else {
			await this.signOutMany(bouncer, members, new Date());
		}
	}

	private async signInMany(bouncer: AppBouncer, members: Pick<TeamMemberSchema, 'id'>[]): Promise<void> {
		if (members.length === 0) {
			return;
		}

		await db
			.update(Schema.teamMembers)
			.set({ pendingSignIn: new Date() })
			.where(
				and(
					// In the list of members
					inArray(
						Schema.teamMembers.memberId,
						members.map((member) => member.id),
					),
					// Not already signed in
					isNull(Schema.teamMembers.pendingSignIn),
					// Not archived
					eq(Schema.teamMembers.archived, false),
				),
			);

		const affectedTeams = await this.eventsService.announceEvent(members, MemberRedisEvent.MemberAttendanceUpdated);

		if (bouncer.user?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: bouncer.user.id,
					event: AnalyticsEvent.TeamMembersBatchSignedIn,
					groups: {
						company: affectedTeam.id,
					},
				});
			}
		}
	}

	private async signOutMany(
		bouncer: AppBouncer,
		members: Pick<TeamMemberSchema, 'id'>[],
		endTime: Date,
	): Promise<void> {
		if (members.length === 0) {
			return;
		}

		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Select members who are signed in and should be signed out
			const dbMembers = await tx
				.select({ memberId: Schema.teamMembers.memberId, pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(
					and(
						// Currently signed in
						isNotNull(Schema.teamMembers.pendingSignIn),
						// Not archived
						inArray(Schema.teamMembers.memberId, memberIds),
					),
				);

			if (dbMembers.length === 0) {
				return;
			}

			await tx.insert(Schema.memberAttendance).values(
				dbMembers.map((member) => {
					const { pendingSignIn } = member;

					assert(pendingSignIn, new TypeError('Expected pending sign in to be defined'));

					return {
						memberId: member.memberId,
						startedAt: pendingSignIn,
						endedAt: endTime,
					};
				}),
			);

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(inArray(Schema.teamMembers.memberId, memberIds));
		});

		const affectedTeams = await this.eventsService.announceEvent(members, MemberRedisEvent.MemberAttendanceUpdated);

		if (bouncer.user?.id) {
			for (const affectedTeam of affectedTeams) {
				ph.capture({
					distinctId: bouncer.user.id,
					event: AnalyticsEvent.TeamMembersBatchSignedOut,
					groups: {
						company: affectedTeam.id,
					},
				});
			}
		}
	}
}
