import { createTRPCClient, unstable_httpBatchStreamLink } from '@trpc/client';
import { cookies } from 'next/headers';
import 'server-only';
import superjson from 'superjson';
import { type AppRouterType, trpcUrl } from './common';

export const trpcServer = createTRPCClient<AppRouterType>({
	links: [
		unstable_httpBatchStreamLink({
			transformer: superjson,
			url: trpcUrl,
			headers() {
				try {
					const requestCookies = cookies();

					return {
						cookie: requestCookies.toString(),
					};
				} catch (error) {
					// World's longest type narrowing expression
					if (
						error &&
						typeof error === 'object' &&
						'digest' in error &&
						typeof error.digest === 'string' &&
						error.digest === 'DYNAMIC_SERVER_USAGE'
					) {
						// This error occurs when Next is building the app for production (https://nextjs.org/docs/messages/dynamic-server-error)
						// Cookies aren't available, but part of static rendering means that this code path is getting executed
						// Since this is during a build, we can safely ignore this error and just not return any headers to add

						return {};
					}

					// This was some other error that occurred while getting the cookies, an error we actually care about
					throw error;
				}
			},
		}),
	],
});
