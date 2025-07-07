import {
	createWSClient,
	type HTTPBatchLinkOptions,
	httpBatchLink,
	httpBatchStreamLink,
	splitLink,
	wsLink,
} from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { convert } from 'convert';
import superjson from 'superjson';
import { getTimezone } from '../utils/timezone-util';
import { type AppRouterType, trpcUrl, trpcWsUrl } from './common';

const httpBatchOptions: HTTPBatchLinkOptions<AppRouterType['_def']['_config']['$types']> = {
	transformer: superjson,
	url: trpcUrl,
	headers() {
		// Whenever the client sends a request (usually client-side mutations or data subscriptions), we try setting a new timezone
		// This is in case a user's timezone changes while they're signed in (ex. travelling)
		return {
			'x-set-timezone': getTimezone(),
		};
	},
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: 'include',
		});
	},
};

const wsClient = createWSClient({
	url: trpcWsUrl.toString(),
	lazy: {
		enabled: true,
		closeMs: convert(1, 'm').to('ms'),
	},
});

export const trpc = createTRPCNext<AppRouterType>({
	transformer: superjson,
	config: () => ({
		links: [
			splitLink({
				condition: (op) => op.type === 'subscription',
				true: wsLink({
					transformer: superjson,
					client: wsClient,
				}),
				false: splitLink({
					// Mutations for auth will totally break and cause session stuff to stop working if you use streaming, since the backend can't set cookies via header properly
					condition: (op) => op.type === 'mutation',
					true: httpBatchLink(httpBatchOptions),
					false: httpBatchStreamLink(httpBatchOptions),
				}),
			}),
		],
	}),
});
