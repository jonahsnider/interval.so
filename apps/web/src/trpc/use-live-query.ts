'use client';

import { hashKey, type QueryKey, skipToken, useQuery } from '@tanstack/react-query';
import { createContext, use, useCallback, useState, useSyncExternalStore } from 'react';
import {
	connectingConnection,
	idleConnection,
	type LiveSubscription,
	type LiveQueryRegistry,
} from './live-query-registry.ts';

export const LiveQueryContext = createContext<LiveQueryRegistry | null>(null);

type Options<T> = {
	query: { queryKey: QueryKey; initialData?: T | (() => T | undefined) };
	subscription: LiveSubscription<T>;
};

export function useLiveQuery<T>({ query, subscription }: Options<T>) {
	const registry = use(LiveQueryContext);
	if (!registry) throw new Error('useLiveQuery requires TrpcProvider');

	const queryKey = hashKey(query.queryKey);
	// Server props seed their original input only, never a newly selected time filter.
	const [initialQueryKey] = useState(queryKey);
	const result = useQuery<T>({
		queryKey: query.queryKey,
		queryFn: skipToken,
		initialData: queryKey === initialQueryKey ? query.initialData : undefined,
		enabled: false,
		// Snapshots include Date instances, which default JSON structural sharing cannot compare.
		structuralSharing: false,
	});
	const subscriptionKey = hashKey(subscription.queryKey);
	const enabled = subscription.enabled;

	// tRPC recreates options each render; serialized keys identify the subscription.
	const subscribe = useCallback(
		(listener: () => void) => {
			if (!enabled) return () => {};
			return registry.subscribe(subscription, query.queryKey, listener);
		},
		[registry, subscriptionKey, queryKey, enabled],
	);
	const getSnapshot = useCallback(
		() => (enabled ? registry.getConnection(subscriptionKey) : idleConnection),
		[registry, subscriptionKey, enabled],
	);
	const getServerSnapshot = useCallback(() => (enabled ? connectingConnection : idleConnection), [enabled]);
	const connection = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	return {
		data: result.data,
		isPending: result.isPending,
		connectionStatus: connection.status,
		error: connection.error,
	};
}
