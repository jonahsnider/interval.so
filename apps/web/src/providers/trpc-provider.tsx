'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, use, useState } from 'react';
import { LiveQueryRegistry } from '../trpc/live-query-registry';
import { LiveQueryContext } from '../trpc/use-live-query';
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

const ResetTrpcContext = createContext<(() => void) | null>(null);

export function useResetTrpcClient() {
	const reset = use(ResetTrpcContext);
	if (!reset) throw new Error('useResetTrpcClient requires TrpcProvider');
	return reset;
}

export function TrpcProvider({ children }: PropsWithChildren) {
	const [clients, setClients] = useState(() => {
		const queryClient = getQueryClient();
		return { ...createClient(), queryClient, registry: new LiveQueryRegistry(queryClient), generation: 0 };
	});
	const reset = () => {
		clients.registry.clear();
		void clients.close();
		clients.queryClient.clear();
		const queryClient = makeQueryClient();
		browserQueryClient = queryClient;
		setClients({
			...createClient(),
			queryClient,
			registry: new LiveQueryRegistry(queryClient),
			generation: clients.generation + 1,
		});
	};

	return (
		<ResetTrpcContext value={reset}>
			<QueryClientProvider key={clients.generation} client={clients.queryClient}>
				<TRPCProvider trpcClient={clients.trpcClient} queryClient={clients.queryClient}>
					<LiveQueryContext value={clients.registry}>{children}</LiveQueryContext>
				</TRPCProvider>
			</QueryClientProvider>
		</ResetTrpcContext>
	);
}
