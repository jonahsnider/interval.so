'use client';

import { usePostHog } from '@posthog/next';
import { type PropsWithChildren, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../trpc/trpc-client';

export function PostHogIdentityProvider({ children }: PropsWithChildren) {
	const posthog = usePostHog();
	const trpc = useTRPC();
	const { data } = useQuery(trpc.user.getSelf.queryOptions());

	useEffect(() => {
		if (data?.user) {
			posthog.identify(data.user.id);
		} else {
			posthog.reset();
		}
	}, [data, posthog]);

	return children;
}
