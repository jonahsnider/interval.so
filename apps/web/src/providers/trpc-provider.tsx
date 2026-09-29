'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';
import { createClient, TRPCProvider } from '../trpc/trpc-client';

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Client Components are server-rendered, so avoid immediately refetching fresh data during hydration.
				staleTime: 30_000,
			},
		},
	});
}

function getQueryClient() {
	if (typeof window === 'undefined') {
		return makeQueryClient();
	}

	return (browserQueryClient ??= makeQueryClient());
}

export function TrpcProvider({ children }: PropsWithChildren) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(createClient);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
