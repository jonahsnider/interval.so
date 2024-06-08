import { BasePolicy, allowGuest } from '@adonisjs/bouncer';
import type { AuthorizerResponse } from '@adonisjs/bouncer/types';
import type { BouncerUser } from '#middleware/initialize_bouncer_middleware';
import type { UserSchema } from './schemas/user_schema.js';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class UserPolicy extends BasePolicy {
	@allowGuest()
	create(_actor: BouncerUser | null): AuthorizerResponse {
		return true;
	}

	read(actor: BouncerUser, user: Pick<UserSchema, 'id'>): AuthorizerResponse {
		return actor.id === user.id;
	}

	update(actor: BouncerUser, user: Pick<UserSchema, 'id'>): AuthorizerResponse {
		return actor.id === user.id;
	}

	delete(actor: BouncerUser, user: Pick<UserSchema, 'id'>): AuthorizerResponse {
		return actor.id === user.id;
	}
}
