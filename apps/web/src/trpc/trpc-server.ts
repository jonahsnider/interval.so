import type { AppRouterType } from '@hours.frc.sh/api/app/routers/app_router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { cookies } from 'next/headers';
import 'server-only';
import superjson from 'superjson';
import { trpcUrl } from './common';

export const trpcServer = createTRPCClient<AppRouterType>({
	links: [
		httpBatchLink({
			transformer: superjson,
			url: trpcUrl,
			headers() {
				return {
					cookie: cookies().toString(),
				};
			},
		}),
	],
});
