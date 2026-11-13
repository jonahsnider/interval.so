import type { Session } from '@adonisjs/session';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { accountAuth } from '../auth/account_auth.ts';
import * as Schema from '#database/schema';
import { ph } from '../analytics/analytics_service.ts';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.ts';
import { db } from '../db/db_service.ts';
import type { UserSchema } from './schemas/user_schema.ts';
import { UserTimezoneSchema } from './schemas/user_timezone_schema.ts';

export class UserService {
	async getUser(user: Pick<UserSchema, 'id'>): Promise<Pick<UserSchema, 'displayName' | 'teams'> | undefined> {
		const dbUser = await db.query.users.findFirst({
			where: { id: user.id },
			columns: {
				displayName: true,
			},
			with: {
				teamManagers: {
					with: {
						team: {
							columns: {
								slug: true,
								displayName: true,
							},
						},
					},
				},
			},
		});

		return dbUser
			? {
					displayName: dbUser.displayName,
					teams: Object.fromEntries(
						dbUser.teamManagers.map((teamManager) => [teamManager.team.slug, teamManager.team]),
					),
				}
			: undefined;
	}

	async deleteUser(user: Pick<UserSchema, 'id'>): Promise<void> {
		const ownedTeam = await db.query.teamManagers.findFirst({
			where: { userId: user.id, role: 'owner' },
			columns: { teamId: true },
		});

		// Team owners need to transfer ownership before deleting their account
		if (ownedTeam) {
			throw new TRPCError({ code: 'FORBIDDEN' });
		}

		await db.delete(Schema.users).where(eq(Schema.users.id, user.id));

		ph.capture({
			distinctId: user.id,
			event: AnalyticsEvent.UserDeleted,
			properties: {
				deleted: true,
			},
		});
	}

	async setDisplayName(user: Pick<UserSchema, 'id'>, updated: Pick<UserSchema, 'displayName'>): Promise<void> {
		const { internalAdapter } = await accountAuth.$context;
		await internalAdapter.updateUser(user.id, { name: updated.displayName });

		ph.capture({
			distinctId: user.id,
			event: AnalyticsEvent.UserNameUpdated,
		});
		ph.identify({
			distinctId: user.id,
			properties: {
				name: updated.displayName,
			},
		});
	}

	getTimezone(session: Session): UserTimezoneSchema {
		const raw = session.get('timezone');

		const parsed = UserTimezoneSchema.safeParse(raw);

		if (parsed.success) {
			return parsed.data;
		}

		return 'UTC';
	}
}
