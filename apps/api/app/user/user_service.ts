import assert from 'node:assert/strict';
import type { HttpContext } from '@adonisjs/core/http';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import { db } from '../db/db_service.js';
import type { UserSchema } from './schemas/user_schema.js';
import { UserTimezoneSchema } from './schemas/user_timezone_schema.js';

export class UserService {
	async getUser(
		bouncer: AppBouncer,
		user: Pick<UserSchema, 'id'>,
	): Promise<Pick<UserSchema, 'displayName'> | undefined> {
		assert(await bouncer.with('UserPolicy').allows('read', user), new TRPCError({ code: 'FORBIDDEN' }));

		const dbUser = await db.query.users.findFirst({
			where: eq(Schema.users.id, user.id),
			columns: {
				displayName: true,
			},
		});

		return dbUser;
	}

	async deleteUser(bouncer: AppBouncer, user: Pick<UserSchema, 'id'>): Promise<void> {
		assert(await bouncer.with('UserPolicy').allows('delete', user), new TRPCError({ code: 'FORBIDDEN' }));

		await db.delete(Schema.users).where(eq(Schema.users.id, user.id));
	}

	async setDisplayName(
		bouncer: AppBouncer,
		user: Pick<UserSchema, 'id'>,
		updated: Pick<UserSchema, 'displayName'>,
	): Promise<void> {
		assert(await bouncer.with('UserPolicy').allows('update', user), new TRPCError({ code: 'FORBIDDEN' }));

		await db.update(Schema.users).set(updated).where(eq(Schema.users.id, user.id));
	}

	getTimezone(context: HttpContext): UserTimezoneSchema {
		const raw = context.session.get('timezone');

		const parsed = UserTimezoneSchema.safeParse(raw);

		if (parsed.success) {
			return parsed.data;
		}

		return 'UTC';
	}
}
