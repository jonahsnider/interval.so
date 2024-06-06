import { eq } from 'drizzle-orm';
import * as Schema from '#database/schema';
import { db } from '../db/db_service.js';
import type { UserSchema } from './schemas/user_schema.js';

export class UserService {
	async getUser(user: Pick<UserSchema, 'id'>): Promise<Pick<UserSchema, 'displayName'> | undefined> {
		const dbUser = await db.query.users.findFirst({
			where: eq(Schema.users.id, user.id),
			columns: {
				displayName: true,
			},
		});

		return dbUser;
	}

	async deleteUser(user: Pick<UserSchema, 'id'>): Promise<void> {
		await db.delete(Schema.users).where(eq(Schema.users.id, user.id));
	}

	async setDisplayName(user: Pick<UserSchema, 'id'>, updated: Pick<UserSchema, 'displayName'>): Promise<void> {
		await db.update(Schema.users).set(updated).where(eq(Schema.users.id, user.id));
	}
}
