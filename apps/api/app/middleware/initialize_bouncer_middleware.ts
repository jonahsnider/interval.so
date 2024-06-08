import * as abilities from '#abilities/main';
import { policies } from '#policies/main';

import { Bouncer } from '@adonisjs/bouncer';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import type { UserSchema } from '../user/schemas/user_schema.js';

export type BouncerUser = Pick<UserSchema, 'id'>;

export type AppBouncer = Bouncer<BouncerUser, typeof abilities, typeof policies>;

/**
 * Init bouncer middleware is used to create a bouncer instance
 * during an HTTP request
 */
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class InitializeBouncerMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		/**
		 * Create bouncer instance for the ongoing HTTP request.
		 * We will pull the user from the HTTP context.
		 */
		ctx.bouncer = new Bouncer(
			(): BouncerUser | undefined => {
				const userId = ctx.session.get('userId') as string | undefined;

				return userId ? { id: userId } : undefined;
			},
			abilities,
			policies,
		).setContainerResolver(ctx.containerResolver);

		return next();
	}
}

declare module '@adonisjs/core/http' {
	export interface HttpContext {
		bouncer: AppBouncer;
	}
}
