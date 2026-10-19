import { Bouncer } from '@adonisjs/bouncer';
import type { BouncerAbility } from '@adonisjs/bouncer/types';
import type { HttpContext } from '@adonisjs/core/http';
import type { Constructor, LazyImport } from '@adonisjs/core/types/common';
import type { NextFn } from '@adonisjs/core/types/http';
import type { Session } from '@adonisjs/session';
import * as abilities from '#abilities/main';
import { policies } from '#policies/main';
import { fromNodeHeaders } from 'better-auth/node';
import type { AccountSession } from '../auth/create_account_auth.ts';
import { setAuthCookies } from '../auth/auth_response.ts';
import { AuthSessionService } from '../auth/auth_session_service.ts';
import type { UserSchema } from '../user/schemas/user_schema.ts';

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
	async handle(ctx: HttpContext, next: NextFn) {
		const authSessions = await ctx.containerResolver.make(AuthSessionService);
		const authHeaders = fromNodeHeaders(ctx.request.headers());
		ctx.account = await authSessions.get(authHeaders, (headers) => setAuthCookies(ctx.response, headers), ctx.session);
		// The exchange's cookie must also reach auth handlers and tRPC in this same request.
		ctx.request.request.headers.cookie = authHeaders.get('cookie') ?? undefined;
		/**
		 * Create bouncer instance for the ongoing HTTP request.
		 * We will pull the user from the HTTP context.
		 */
		ctx.bouncer = createBouncer(ctx.session, ctx.account).setContainerResolver(ctx.containerResolver);

		return next();
	}
}

class BouncerWithUser<
	// oxlint-disable-next-line typescript/no-explicit-any -- This is taken from AdonisJS typings
	User extends Record<any, any>,
	// oxlint-disable-next-line typescript/no-explicit-any -- This is taken from AdonisJS typings
	Abilities extends Record<string, BouncerAbility<any>> | undefined = undefined,
	// oxlint-disable-next-line typescript/no-explicit-any -- This is taken from AdonisJS typings
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

export function createBouncer(session: Session, account: AccountSession | null = null): AppBouncer {
	return new BouncerWithUser<BouncerUser, typeof abilities, typeof policies>(
		(): BouncerUser | null => {
			const userId = account?.user.id;
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
		account: AccountSession | null;
	}
}
