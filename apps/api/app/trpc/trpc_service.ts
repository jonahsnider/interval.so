import * as Sentry from '@sentry/node';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { createHttpContext } from './trpc_context.js';

const t = initTRPC.context<typeof createHttpContext>().create({
	transformer: superjson,
	// I don't want to see stacktraces in TRPC errors even in development
	// Makes it harder to figure out what users actually would see
	isDev: false,
});

const sentryMiddleware = t.middleware(
	Sentry.trpcMiddleware({
		attachRpcInput: true,
	}),
);

export const router = t.router;

export const publicProcedure = t.procedure.use(sentryMiddleware).use(({ ctx, next }) => {
	const userId = ctx.session.get('userId') as undefined | string;
	const guestToken = ctx.session.get('guestToken') as undefined | string;

	return next({
		ctx: {
			...ctx,
			user: userId
				? {
						id: userId,
					}
				: undefined,
			guestToken,
		},
	});
});
export const authedProcedure = publicProcedure.use(({ ctx, next }) => {
	if (ctx.user) {
		return next({
			ctx: {
				...ctx,
				user: ctx.user,
			},
		});
	}

	throw new TRPCError({
		code: 'UNAUTHORIZED',
		message: 'You must be signed in to perform this action',
	});
});
