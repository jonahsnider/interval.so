import assert from 'node:assert/strict';
import { TRPCError } from '@trpc/server';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import { and, count, eq, inArray } from 'drizzle-orm';
import postgres from 'postgres';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { ph } from '../analytics/analytics_service.js';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { TeamManagerSchema } from '../team_manager/schemas/team_manager_schema.js';
import type { UserSchema } from '../user/schemas/user_schema.js';
import type { TeamSchema } from './schemas/team_schema.js';

export class TeamService {
	private static readonly MAX_TEAMS_PER_USER = 10;

	private static generateInviteCode(): Promise<string> {
		return cryptoRandomStringAsync({
			length: 32,
			type: 'alphanumeric',
		});
	}

	async create(
		input: Pick<TeamSchema, 'displayName' | 'password' | 'slug'>,
		user: Pick<UserSchema, 'id'>,
	): Promise<void> {
		// Count teams this user is an owner of
		const [ownedTeams] = await db
			.select({ count: count() })
			.from(Schema.teamManagers)
			.where(and(eq(Schema.teamManagers.userId, user.id), eq(Schema.teamManagers.role, 'owner')));

		assert(ownedTeams);

		if (ownedTeams.count > TeamService.MAX_TEAMS_PER_USER) {
			throw new TRPCError({
				code: 'UNPROCESSABLE_CONTENT',
				message: `You can't be the owner of more than ${TeamService.MAX_TEAMS_PER_USER} teams`,
			});
		}

		try {
			await db.transaction(async (tx) => {
				// Create team
				const [team] = await tx
					.insert(Schema.teams)
					.values({
						displayName: input.displayName,
						slug: input.slug,
						password: input.password,
						inviteCode: await TeamService.generateInviteCode(),
					})
					.returning({ teamId: Schema.teams.teamId });

				assert(team);

				// Create team user
				await tx.insert(Schema.teamManagers).values({
					teamId: team.teamId,
					userId: user.id,
					role: 'owner',
				});

				ph.capture({
					distinctId: user.id,
					event: AnalyticsEvent.TeamCreated,
					groups: {
						company: team.teamId,
					},
				});
				ph.groupIdentify({
					groupKey: team.teamId,
					groupType: 'company',
					properties: {
						name: input.displayName,
						slug: input.slug,
						// biome-ignore lint/style/useNamingConvention: This should be snake case
						date_created: new Date(),
					},
				});
			});
		} catch (error) {
			if (error instanceof postgres.PostgresError && error.code === '23505') {
				// Team slug collision
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'A team with that URL already exists',
				});
			}

			throw error;
		}
	}

	async getDisplayName(team: Pick<TeamSchema, 'slug'>): Promise<string> {
		// No auth needed, team display name/existence is public

		const result = await db.query.teams.findFirst({
			where: eq(Schema.teams.slug, team.slug),
			columns: {
				displayName: true,
			},
		});

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));

		return result.displayName;
	}

	async setDisplayName(
		bouncer: AppBouncer,
		team: Pick<TeamSchema, 'slug'>,
		data: Pick<TeamSchema, 'displayName'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('updateSettings', team));

		const [dbTeam] = await db.update(Schema.teams).set(data).where(eq(Schema.teams.slug, team.slug)).returning({
			teamId: Schema.teams.teamId,
		});

		if (dbTeam) {
			ph.groupIdentify({
				groupKey: dbTeam.teamId,
				groupType: 'company',
				properties: {
					name: data.displayName,
				},
			});
		}
	}

	async getTeamBySlug(team: Pick<TeamSchema, 'slug'>): Promise<Pick<TeamSchema, 'id'>> {
		const result = await db.query.teams.findFirst({
			where: eq(Schema.teams.slug, team.slug),
			columns: {
				teamId: true,
			},
		});

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));

		return {
			id: result.teamId,
		};
	}

	async getTeamById(team: Pick<TeamSchema, 'id'>): Promise<Pick<TeamSchema, 'slug' | 'displayName'> | undefined> {
		const result = await db.query.teams.findFirst({
			where: eq(Schema.teams.teamId, team.id),
			columns: {
				slug: true,
				displayName: true,
			},
		});

		return result;
	}

	async delete(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('delete', team));

		await db.transaction(async (tx) => {
			const targetTeamCte = tx
				.$with('target_team_cte')
				.as(tx.select({ teamId: Schema.teams.teamId }).from(Schema.teams).where(eq(Schema.teams.slug, team.slug)));

			const targetTeamSubquery = tx.select({ teamId: targetTeamCte.teamId }).from(targetTeamCte);

			const targetMembersCte = tx.$with('target_members_cte').as(
				tx
					.select({ memberId: Schema.teamMembers.memberId })
					.from(Schema.teamMembers)
					.where(
						eq(
							Schema.teamMembers.teamId,
							tx
								.select({
									teamId: Schema.teams.teamId,
								})
								.from(Schema.teams)
								.where(eq(Schema.teams.slug, team.slug)),
						),
					),
			);

			// Delete member attendance for team members
			await tx
				.with(targetMembersCte)
				.delete(Schema.memberAttendance)
				.where(
					inArray(
						Schema.memberAttendance.memberId,
						tx.select({ memberId: targetMembersCte.memberId }).from(targetMembersCte),
					),
				);

			// Delete team members
			await tx.with(targetTeamCte).delete(Schema.teamMembers).where(eq(Schema.teamMembers.teamId, targetTeamSubquery));

			// Delete team managers
			await tx
				.with(targetTeamCte)
				.delete(Schema.teamManagers)
				.where(eq(Schema.teamManagers.teamId, targetTeamSubquery));

			// Delete team
			const [dbTeam] = await tx.delete(Schema.teams).where(eq(Schema.teams.slug, team.slug)).returning({
				teamId: Schema.teams.teamId,
			});

			if (dbTeam) {
				if (bouncer.user?.id) {
					ph.capture({
						distinctId: bouncer.user.id,
						event: AnalyticsEvent.TeamDeleted,
						groups: {
							company: dbTeam.teamId,
						},
					});
				}
				ph.groupIdentify({
					groupKey: dbTeam.teamId,
					groupType: 'company',
					properties: {
						deleted: true,
					},
				});
			}
		});
	}

	async getPassword(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<Pick<TeamSchema, 'password'>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewSettings', team));

		const result = await db.query.teams.findFirst({
			columns: {
				password: true,
			},
			where: eq(Schema.teams.slug, team.slug),
		});

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));

		return result;
	}

	async setPassword(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, data: Pick<TeamSchema, 'password'>) {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('updateSettings', team));

		await db.update(Schema.teams).set(data).where(eq(Schema.teams.slug, team.slug));
	}

	async getInviteCode(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<Pick<TeamSchema, 'inviteCode'>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('viewInviteUrl', team));

		const result = await db.query.teams.findFirst({
			columns: {
				inviteCode: true,
			},
			where: eq(Schema.teams.slug, team.slug),
		});

		assert(result, new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' }));

		return result;
	}

	async resetInviteCode(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>): Promise<Pick<TeamSchema, 'inviteCode'>> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('resetInviteUrl', team));

		const newCode = await TeamService.generateInviteCode();

		await db.update(Schema.teams).set({ inviteCode: newCode }).where(eq(Schema.teams.slug, team.slug));

		return { inviteCode: newCode };
	}

	async setSlug(bouncer: AppBouncer, team: Pick<TeamSchema, 'slug'>, data: Pick<TeamSchema, 'slug'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('TeamPolicy').allows('updateSettings', team));

		try {
			const [dbTeam] = await db.update(Schema.teams).set(data).where(eq(Schema.teams.slug, team.slug)).returning({
				teamId: Schema.teams.teamId,
			});

			if (dbTeam) {
				ph.groupIdentify({
					groupKey: dbTeam.teamId,
					groupType: 'company',
					properties: {
						slug: data.slug,
					},
				});
			}
		} catch (error) {
			if (error instanceof postgres.PostgresError && error.code === '23505') {
				// Team slug collision
				throw new TRPCError({
					code: 'UNPROCESSABLE_CONTENT',
					message: 'A team with that URL already exists',
				});
			}

			throw error;
		}
	}

	async getTeamByInviteCode(input: Pick<TeamSchema, 'inviteCode'>): Promise<{
		team: Pick<TeamSchema, 'displayName'>;
		owner: Pick<TeamManagerSchema['user'], 'displayName'>;
	}> {
		const result = await db.query.teams.findFirst({
			columns: {
				displayName: true,
			},
			where: eq(Schema.teams.inviteCode, input.inviteCode),
			with: {
				managers: {
					with: {
						user: {
							columns: {
								displayName: true,
							},
						},
					},
					where: eq(Schema.teamManagers.role, 'owner'),
					limit: 1,
				},
			},
		});

		if (!result) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Incorrect invite code',
			});
		}

		const [owner] = result.managers;

		assert(owner, new TypeError('Team is missing an owner'));

		return {
			team: {
				displayName: result.displayName,
			},
			owner: { displayName: owner.user.displayName },
		};
	}

	/** An internal method to check whether a user is an owner of any team. */
	async internalIsAnyTeamOwner(user: Pick<UserSchema, 'id'>): Promise<boolean> {
		const [result] = await db
			.select({ count: count() })
			.from(Schema.teamManagers)
			.where(and(eq(Schema.teamManagers.userId, user.id), eq(Schema.teamManagers.role, 'owner')));

		assert(result);

		return result.count > 0;
	}
}
