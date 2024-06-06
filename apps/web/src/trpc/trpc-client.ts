import type { AppRouterType } from '@hours.frc.sh/api/app/routers/app_router';
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import { trpcUrl } from './common';

export const trpc = createTRPCNext<AppRouterType>({
	transformer: superjson,
	config: () => ({
		links: [
			httpBatchLink({
				transformer: superjson,
				url: trpcUrl,
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
