import { Bouncer } from '@adonisjs/bouncer';
import type { BouncerAbility, Constructor, LazyImport } from '@adonisjs/bouncer/types';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import type { Session } from '@adonisjs/session';
import * as abilities from '#abilities/main';
import { policies } from '#policies/main';
import type { UserSchema } from '../user/schemas/user_schema.js';

export type BouncerUser =
	// Regular team user auth
	| Pick<UserSchema, 'id'>
	// Guest password auth
	| {
			id: undefined;
			unvalidatedGuestToken: string;
	  };

export type AppBouncer = BouncerWithUser<BouncerUser, typeof abilities, typeof policies>;

/**
 * Init bouncer middleware is used to create a bouncer instance
 * during an HTTP request
 */
export default class InitializeBouncerMiddleware {
	handle(ctx: HttpContext, next: NextFn) {
		/**
		 * Create bouncer instance for the ongoing HTTP request.
		 * We will pull the user from the HTTP context.
		 */
		ctx.bouncer = createBouncer(ctx.session).setContainerResolver(ctx.containerResolver);

		return next();
	}
}

class BouncerWithUser<
	// biome-ignore lint/suspicious/noExplicitAny: This is taken from AdonisJS typings
	User extends Record<any, any>,
	// biome-ignore lint/suspicious/noExplicitAny: This is taken from AdonisJS typings
	Abilities extends Record<string, BouncerAbility<any>> | undefined = undefined,
	// biome-ignore lint/suspicious/noExplicitAny: This is taken from AdonisJS typings
	Policies extends Record<string, LazyImport<Constructor<any>>> | undefined = undefined,
> extends Bouncer<User, Abilities, Policies> {
	readonly user: User | null;

	constructor(userOrResolver: User | (() => User | null) | null, abilities?: Abilities, policies?: Policies) {
		super(userOrResolver, abilities, policies);

		if (userOrResolver instanceof Function) {
			this.user = userOrResolver();
		} else {
			this.user = userOrResolver;
		}
	}
}

export function createBouncer(session: Session): AppBouncer {
	return new BouncerWithUser<BouncerUser, typeof abilities, typeof policies>(
		(): BouncerUser | null => {
			const userId = session.get('userId') as string | undefined;
			const guestToken = session.get('guestToken') as string | undefined;

			if (userId) {
				return { id: userId };
			}

			if (guestToken) {
				return { id: undefined, unvalidatedGuestToken: guestToken };
			}

			return null;
		},
		abilities,
		policies,
	);
}

declare module '@adonisjs/core/http' {
	export interface HttpContext {
		bouncer: AppBouncer;
	}
}
