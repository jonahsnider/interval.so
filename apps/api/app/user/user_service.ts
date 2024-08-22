import type { Session } from '@adonisjs/session';
import { eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { ph } from '../analytics/analytics_service.js';
import { AnalyticsEvent } from '../analytics/schemas/analytics_event.js';
import { AuthorizationService } from '../authorization/authorization_service.js';
import { db } from '../db/db_service.js';
import type { UserSchema } from './schemas/user_schema.js';
import { UserTimezoneSchema } from './schemas/user_timezone_schema.js';

export class UserService {
	async getUser(
		bouncer: AppBouncer,
		user: Pick<UserSchema, 'id'>,
	): Promise<Pick<UserSchema, 'displayName'> | undefined> {
		await AuthorizationService.assertPermission(bouncer.with('UserPolicy').allows('read', user));

		const dbUser = await db.query.users.findFirst({
			where: eq(Schema.users.userId, user.id),
			columns: {
				displayName: true,
			},
		});

		return dbUser;
	}

	async deleteUser(bouncer: AppBouncer, user: Pick<UserSchema, 'id'>): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('UserPolicy').allows('delete', user));

		await db.delete(Schema.users).where(eq(Schema.users.userId, user.id));

		ph.capture({
			distinctId: user.id,
			event: AnalyticsEvent.UserDeleted,
			properties: {
				deleted: true,
			},
		});
	}

	async setDisplayName(
		bouncer: AppBouncer,
		user: Pick<UserSchema, 'id'>,
		updated: Pick<UserSchema, 'displayName'>,
	): Promise<void> {
		await AuthorizationService.assertPermission(bouncer.with('UserPolicy').allows('update', user));

		await db.update(Schema.users).set(updated).where(eq(Schema.users.userId, user.id));

		ph.capture({
			distinctId: user.id,
			event: AnalyticsEvent.UserNameChanged,
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
