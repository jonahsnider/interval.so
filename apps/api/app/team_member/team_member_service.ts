import assert from 'node:assert/strict';
import { inject } from '@adonisjs/core';
import { TRPCError } from '@trpc/server';
import { and, asc, count, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import postgres from 'postgres';
import { type Observable, concat, from, mergeMap } from 'rxjs';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import { RedisEvent } from './events/schemas/redis_event_schema.js';
import { TeamMemberEventsService } from './events/team_member_events_service.js';
import type { SimpleTeamMemberSchema, TeamMemberSchema } from './schemas/team_member_schema.js';

/** A team member is someone whose attendance is tracked by team users. */
@inject()
@injectHelper(TeamMemberEventsService)
export class TeamMemberService {
	private static readonly MAX_MEMBERS_PER_TEAM = 1000;

	constructor(private readonly eventsService: TeamMemberEventsService) {}

	async simpleTeamMemberListSubscribe(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Observable<SimpleTeamMemberSchema[]>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));
		const memberChanges = await this.eventsService.subscribeForTeam(bouncer, team);

		return concat(
			// Emit one event on subscribe
			from(this.getTeamMembersSimple(bouncer, team)),
			// Each time the team members change, emit a new event
			memberChanges.pipe(mergeMap(() => from(this.getTeamMembersSimple(bouncer, team)))),
		);
	}

	async getTeamMembersSimple(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<SimpleTeamMemberSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewSimpleMemberList', team));

		const result = await db.query.teams.findFirst({
			columns: {},
			where: eq(Schema.teams.slug, team.slug),
			with: {
				members: {
					columns: {
						id: true,
						name: true,
					},
					extras: {
						atMeeting: isNotNull(Schema.teamMembers.pendingSignIn).as('at_meeting'),
					},
					orderBy: asc(Schema.teamMembers.name),
					where: eq(Schema.teamMembers.archived, false),
				},
			},
		});

		return (
			result?.members.map((member) => ({
				id: member.id,
				name: member.name,
				atMeeting: member.atMeeting as boolean,
			})) ?? []
		);
	}

	async getTeamMembersFull(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<TeamMemberSchema[]> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('viewFullMemberList', team));

		const result = await db.query.teams.findFirst({
			columns: {},
			where: eq(Schema.teams.slug, team.slug),
			with: {
				members: {
					columns: {
						id: true,
						name: true,
						archived: true,
						createdAt: true,
						pendingSignIn: true,
					},
					with: {
						meetings: {
							columns: {
								endedAt: true,
							},
							limit: 1,
							orderBy: asc(Schema.finishedMemberMeetings.endedAt),
						},
					},
				},
			},
		});

		return (
			result?.members.map((member) => ({
				id: member.id,
				name: member.name,
				archived: member.archived,
				createdAt: member.createdAt,
				atMeeting: Boolean(member.pendingSignIn),
				// If signed in, mark them as last seen now
				// Otherwise, use the last time they signed out
				lastSeenAt: member.pendingSignIn ? 'now' : member.meetings[0]?.endedAt,
			})) ?? []
		);
	}

	async create(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		data: Pick<TeamMemberSchema, 'name'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('create', team));

		// TODO: Limit teams to 1000 members (doesn't matter if unarchived or archived)

		const [dbTeam, [members]] = await Promise.all([
			db.query.teams.findFirst({
				columns: {
					id: true,
				},
				where: eq(Schema.teams.slug, team.slug),
			}),
			db
				.select({ count: count() })
				.from(Schema.teamMembers)
				.innerJoin(Schema.teams, and(eq(Schema.teamMembers.teamId, Schema.teams.id), eq(Schema.teams.slug, team.slug)))
				.where(eq(Schema.teams.slug, team.slug)),
		]);

		assert(dbTeam, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));
		assert(members);

		if (members.count >= TeamMemberService.MAX_MEMBERS_PER_TEAM) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: `You can't have more than ${TeamMemberService.MAX_MEMBERS_PER_TEAM} members in a team, try deleting some members first`,
			});
		}

		try {
			await db.insert(Schema.teamMembers).values({
				teamId: dbTeam.id,
				name: data.name,
			});
		} catch (error) {
			if (error instanceof postgres.PostgresError && error.code === '23505') {
				// Team member name collision
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'A team member with that name already exists',
				});
			}

			throw error;
		}

		await this.eventsService.announceEvent(team, RedisEvent.MemberCreated);
	}

	async updateAttendance(
		bouncer: AppBouncer,
		teamMember: Pick<TeamMemberSchema, 'id'>,
		data: Pick<TeamMemberSchema, 'atMeeting'>,
	) {
		await AuthorizationService.assertPermission(
			bouncer.with('TeamMemberPolicy').allows('updateAttendance', teamMember),
		);

		if (data.atMeeting) {
			await this.signIn(teamMember);
		} else {
			await this.signOut(teamMember);
		}

		const teamQuery = await db.query.teamMembers.findFirst({
			columns: {},
			where: eq(Schema.teamMembers.id, teamMember.id),
			with: { team: { columns: { id: true } } },
		});

		assert(teamQuery, new TypeError('Expected team to be associated with the team member'));
	}

	private async signIn(teamMember: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		// Mark the user as pending sign in right now
		// If they were already signed in, do nothing, we don't want to overwrite the old sign in time

		await db
			.update(Schema.teamMembers)
			.set({ pendingSignIn: new Date() })
			.where(
				and(
					eq(Schema.teamMembers.id, teamMember.id),
					isNull(Schema.teamMembers.pendingSignIn),
					eq(Schema.teamMembers.archived, false),
				),
			);

		await this.eventsService.announceEvent([teamMember], RedisEvent.MemberAttendanceUpdated);
	}

	private async signOut(teamMember: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			const [pendingSignIn] = await tx
				.select({ pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(and(eq(Schema.teamMembers.id, teamMember.id), eq(Schema.teamMembers.archived, false)));

			if (!pendingSignIn?.pendingSignIn) {
				return;
			}

			await tx.insert(Schema.finishedMemberMeetings).values({
				memberId: teamMember.id,
				startedAt: pendingSignIn.pendingSignIn,
				endedAt: new Date(),
			});

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(and(eq(Schema.teamMembers.id, teamMember.id), eq(Schema.teamMembers.archived, false)));
		});

		await this.eventsService.announceEvent([teamMember], RedisEvent.MemberAttendanceUpdated);
	}

	async signOutAll(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, endTime: Date): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('signOutAll', team));

		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			// Select members who are signed in and should be signed out
			const members = await tx
				.select({
					id: Schema.teamMembers.id,
					pendingSignIn: Schema.teamMembers.pendingSignIn,
				})
				.from(Schema.teamMembers)
				.innerJoin(
					Schema.teams,
					and(
						eq(Schema.teamMembers.teamId, Schema.teams.id),
						eq(Schema.teams.slug, team.slug),
						isNotNull(Schema.teamMembers.pendingSignIn),
					),
				);

			if (members.length === 0) {
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'There is no meeting in progress',
				});
			}

			await tx.insert(Schema.finishedMemberMeetings).values(
				members.map((member) => {
					const { pendingSignIn } = member;

					assert(pendingSignIn, new TypeError('Expected pending sign in to be defined'));
					assert(
						pendingSignIn.getTime() <= endTime.getTime(),
						new TRPCError({ code: 'UNPROCESSABLE_CONTENT', message: 'Cannot end meeting before it starts' }),
					);

					return {
						memberId: member.id,
						startedAt: pendingSignIn,
						endedAt: endTime,
					};
				}),
			);

			await tx.update(Schema.teamMembers).set({ pendingSignIn: null });
		});

		await this.eventsService.announceEvent(team, RedisEvent.MemberAttendanceUpdated);
	}

	async setArchived(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id' | 'archived'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', [member]));

		if (member.archived) {
			const dbMember = await db.query.teamMembers.findFirst({
				columns: {
					pendingSignIn: true,
				},
				where: eq(Schema.teamMembers.id, member.id),
			});

			if (dbMember?.pendingSignIn) {
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'Cannot archive a member who is currently signed in',
				});
			}
		}

		await db
			.update(Schema.teamMembers)
			.set({ archived: member.archived, pendingSignIn: null })
			.where(eq(Schema.teamMembers.id, member.id));

		await this.eventsService.announceEvent([member], RedisEvent.MemberUpdated);
	}

	async delete(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('delete', [member]));

		await db.transaction(async (tx) => {
			// Delete meetings
			await tx.delete(Schema.finishedMemberMeetings).where(eq(Schema.finishedMemberMeetings.memberId, member.id));
			// Delete member
			await tx.delete(Schema.teamMembers).where(eq(Schema.teamMembers.id, member.id));
		});

		await this.eventsService.announceEvent([member], RedisEvent.MemberDeleted);
	}

	async deleteMany(bouncer: AppBouncer, members: Pick<TeamMemberSchema, 'id'>[]) {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('delete', members));

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Delete meetings
			await tx.delete(Schema.finishedMemberMeetings).where(inArray(Schema.finishedMemberMeetings.memberId, memberIds));
			// Delete member
			await tx.delete(Schema.teamMembers).where(inArray(Schema.teamMembers.id, memberIds));
		});

		await this.eventsService.announceEvent(members, RedisEvent.MemberDeleted);
	}

	async setArchivedMany(
		bouncer: AppBouncer,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: Pick<TeamMemberSchema, 'archived'>,
	) {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', members));

		const memberIds = members.map((member) => member.id);

		if (data.archived) {
			const dbMembers = await db.query.teamMembers.findMany({
				columns: {
					pendingSignIn: true,
				},
				where: inArray(Schema.teamMembers.id, memberIds),
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
			.where(inArray(Schema.teamMembers.id, memberIds));

		await this.eventsService.announceEvent(members, RedisEvent.MemberUpdated);
	}

	async updateAttendanceMany(
		bouncer: AppBouncer,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: Pick<TeamMemberSchema, 'atMeeting'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamMemberPolicy').allows('update', members));

		if (data.atMeeting) {
			await this.signInMany(members);
		} else {
			await this.signOutMany(members, new Date());
		}
	}

	private async signInMany(members: Pick<TeamMemberSchema, 'id'>[]): Promise<void> {
		await db
			.update(Schema.teamMembers)
			.set({ pendingSignIn: new Date() })
			.where(
				and(
					// In the list of members
					inArray(
						Schema.teamMembers.id,
						members.map((member) => member.id),
					),
					// Not already signed in
					isNull(Schema.teamMembers.pendingSignIn),
					// Not archived
					eq(Schema.teamMembers.archived, false),
				),
			);

		await this.eventsService.announceEvent(members, RedisEvent.MemberAttendanceUpdated);
	}

	private async signOutMany(members: Pick<TeamMemberSchema, 'id'>[], endTime: Date): Promise<void> {
		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Select members who are signed in and should be signed out
			const dbMembers = await tx
				.select({ id: Schema.teamMembers.id, pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(
					and(
						// Currently signed in
						isNotNull(Schema.teamMembers.pendingSignIn),
						// Not archived
						inArray(Schema.teamMembers.id, memberIds),
					),
				);

			if (dbMembers.length === 0) {
				return;
			}

			await tx.insert(Schema.finishedMemberMeetings).values(
				dbMembers.map((member) => {
					const { pendingSignIn } = member;

					assert(pendingSignIn, new TypeError('Expected pending sign in to be defined'));

					return {
						memberId: member.id,
						startedAt: pendingSignIn,
						endedAt: endTime,
					};
				}),
			);

			await tx.update(Schema.teamMembers).set({ pendingSignIn: null }).where(inArray(Schema.teamMembers.id, memberIds));
		});

		await this.eventsService.announceEvent(members, RedisEvent.MemberAttendanceUpdated);
	}
}
