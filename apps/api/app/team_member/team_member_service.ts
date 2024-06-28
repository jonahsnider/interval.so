import assert from 'node:assert/strict';
import transmit from '@adonisjs/transmit/services/main';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import postgres from 'postgres';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { TeamSchema } from '../team/schemas/team_schema.js';
import type { TeamMemberSchema } from './schemas/team_member_schema.js';

/** A team member is someone whose attendance is tracked by team users. */
export class TeamMemberService {
	private static transmitChannel(team: Pick<TeamSchema, 'slug'>): string {
		return `team/${team.slug}/members`;
	}

	async getTeamByMember(teamMember: Pick<TeamMemberSchema, 'id'>): Promise<Pick<TeamSchema, 'slug'> | undefined> {
		const team = await db.query.teamMembers.findFirst({
			columns: {
				teamSlug: true,
			},
			where: eq(Schema.teamMembers.id, teamMember.id),
		});

		if (team) {
			return { slug: team.teamSlug };
		}

		return undefined;
	}

	async getTeamMembersSimple(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
	): Promise<Pick<TeamMemberSchema, 'id' | 'name' | 'atMeeting'>[]> {
		assert(await bouncer.with('TeamMemberPolicy').allows('readSimple', team), new TRPCError({ code: 'FORBIDDEN' }));

		const members = await db.query.teamMembers.findMany({
			columns: {
				id: true,
				name: true,
				pendingSignIn: true,
			},
			where: and(
				// Members in this team
				eq(Schema.teamMembers.teamSlug, team.slug),
				// That aren't archived
				eq(Schema.teamMembers.archived, false),
			),
			orderBy: asc(Schema.teamMembers.name),
		});

		return members.map((member) => ({
			id: member.id,
			name: member.name,
			atMeeting: Boolean(member.pendingSignIn),
		}));
	}

	async getTeamMembersFull(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<TeamMemberSchema[]> {
		assert(await bouncer.with('TeamMemberPolicy').allows('readFull', team), new TRPCError({ code: 'FORBIDDEN' }));

		const members = await db.query.teamMembers.findMany({
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
					orderBy: desc(Schema.finishedMemberMeetings.endedAt),
				},
			},
			where: eq(Schema.teamMembers.teamSlug, team.slug),
		});

		return members.map((member) => ({
			id: member.id,
			name: member.name,
			archived: member.archived,
			createdAt: member.createdAt,
			atMeeting: Boolean(member.pendingSignIn),
			// If signed in, mark them as last seen now
			// Otherwise, use the last time they signed out
			lastSeenAt: member.pendingSignIn ? 'now' : member.meetings[0]?.endedAt,
		}));
	}

	async create(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		data: Pick<TeamMemberSchema, 'name'>,
	): Promise<void> {
		assert(await bouncer.with('TeamMemberPolicy').allows('create', team), new TRPCError({ code: 'FORBIDDEN' }));

		// TODO: Limit teams to 1000 members (doesn't matter if unarchived or archived)

		try {
			await db.insert(Schema.teamMembers).values({
				teamSlug: team.slug,
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
		}

		transmit.broadcast(TeamMemberService.transmitChannel(team));
	}

	async updateAttendance(
		bouncer: AppBouncer,
		teamMember: Pick<TeamMemberSchema, 'id'>,
		data: Pick<TeamMemberSchema, 'atMeeting'>,
	) {
		assert(
			await bouncer.with('TeamMemberPolicy').allows('updateAttendance', teamMember),
			new TRPCError({ code: 'FORBIDDEN' }),
		);

		if (data.atMeeting) {
			await this.signIn(teamMember);
		} else {
			await this.signOut(teamMember);
		}

		const teamQuery = await db.query.teamMembers.findFirst({
			columns: {},
			where: eq(Schema.teamMembers.id, teamMember.id),
			with: { team: { columns: { slug: true } } },
		});

		assert(teamQuery, new TypeError('Expected team to be associated with the team member'));

		transmit.broadcast(TeamMemberService.transmitChannel(teamQuery.team));
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
	}

	async signOutAll(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, endTime: Date): Promise<void> {
		assert(await bouncer.with('TeamPolicy').allows('update', team), new TRPCError({ code: 'FORBIDDEN' }));

		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			// Select members who are signed in and should be signed out
			const members = await tx
				.select({ id: Schema.teamMembers.id, pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(and(eq(Schema.teamMembers.teamSlug, team.slug), isNotNull(Schema.teamMembers.pendingSignIn)));

			if (members.length === 0) {
				return;
			}

			await tx.insert(Schema.finishedMemberMeetings).values(
				members.map((member) => {
					const { pendingSignIn } = member;

					assert(pendingSignIn, new TypeError('Expected pending sign in to be defined'));

					return {
						memberId: member.id,
						startedAt: pendingSignIn,
						endedAt: endTime,
					};
				}),
			);

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(eq(Schema.teamMembers.teamSlug, team.slug));
		});
	}

	async setArchived(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id' | 'archived'>): Promise<void> {
		assert(await bouncer.with('TeamMemberPolicy').allows('update', member), new TRPCError({ code: 'FORBIDDEN' }));

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
	}

	async delete(bouncer: AppBouncer, member: Pick<TeamMemberSchema, 'id'>): Promise<void> {
		assert(await bouncer.with('TeamMemberPolicy').allows('delete', member), new TRPCError({ code: 'FORBIDDEN' }));

		await db.transaction(async (tx) => {
			// Delete meetings
			await tx.delete(Schema.finishedMemberMeetings).where(eq(Schema.finishedMemberMeetings.memberId, member.id));
			// Delete member
			await tx.delete(Schema.teamMembers).where(eq(Schema.teamMembers.id, member.id));
		});
	}

	async deleteMany(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, members: Pick<TeamMemberSchema, 'id'>[]) {
		assert(await bouncer.with('TeamPolicy').allows('update', team), new TRPCError({ code: 'FORBIDDEN' }));

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Delete meetings
			await tx.delete(Schema.finishedMemberMeetings).where(inArray(Schema.finishedMemberMeetings.memberId, memberIds));
			// Delete member
			await tx.delete(Schema.teamMembers).where(inArray(Schema.teamMembers.id, memberIds));
		});
	}

	async setArchivedMany(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: Pick<TeamMemberSchema, 'archived'>,
	) {
		assert(await bouncer.with('TeamPolicy').allows('update', team), new TRPCError({ code: 'FORBIDDEN' }));

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
	}

	async updateAttendanceMany(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		members: Pick<TeamMemberSchema, 'id'>[],
		data: Pick<TeamMemberSchema, 'atMeeting'>,
	): Promise<void> {
		assert(await bouncer.with('TeamPolicy').allows('update', team), new TRPCError({ code: 'FORBIDDEN' }));

		if (data.atMeeting) {
			await this.signInMany(team, members);
		} else {
			await this.signOutMany(team, members, new Date());
		}
	}

	private async signInMany(team: Pick<TeamSchema, 'slug'>, members: Pick<TeamMemberSchema, 'id'>[]): Promise<void> {
		await db
			.update(Schema.teamMembers)
			.set({ pendingSignIn: new Date() })
			.where(
				and(
					// On this team
					eq(Schema.teamMembers.teamSlug, team.slug),
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
	}

	private async signOutMany(
		team: Pick<TeamSchema, 'slug'>,
		members: Pick<TeamMemberSchema, 'id'>[],
		endTime: Date,
	): Promise<void> {
		// TODO: Rewrite this to use a single query (CTE?) instead of doing the select and then insert

		await db.transaction(async (tx) => {
			const memberIds = members.map((member) => member.id);

			// Select members who are signed in and should be signed out
			const dbMembers = await tx
				.select({ id: Schema.teamMembers.id, pendingSignIn: Schema.teamMembers.pendingSignIn })
				.from(Schema.teamMembers)
				.where(
					and(
						// On this team
						eq(Schema.teamMembers.teamSlug, team.slug),
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

			await tx
				.update(Schema.teamMembers)
				.set({ pendingSignIn: null })
				.where(and(eq(Schema.teamMembers.teamSlug, team.slug), inArray(Schema.teamMembers.id, memberIds)));
		});
	}
}
