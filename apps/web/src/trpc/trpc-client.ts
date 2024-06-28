import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import { getTimezone } from '../utils/timezone-util';
import { type AppRouterType, trpcUrl } from './common';

export const trpc = createTRPCNext<AppRouterType>({
	transformer: superjson,
	config: () => ({
		links: [
			httpBatchLink({
				transformer: superjson,
				url: trpcUrl,
				headers() {
					// Whenever the client sends a request (which is only really client-side mutations), we try setting a new timezone
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
			}),
		],
	}),
});
