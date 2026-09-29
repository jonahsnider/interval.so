'use client';

import posthog from 'posthog-js';
import { type PropsWithChildren, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../trpc/trpc-client';

export function PostHogIdentityProvider({ children }: PropsWithChildren) {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.user.getSelf.queryOptions());

	useEffect(() => {
		if (data?.user) {
			posthog.identify(data.user.id);
		} else {
			posthog.reset();
		}
	}, [data]);

	return children;
}
