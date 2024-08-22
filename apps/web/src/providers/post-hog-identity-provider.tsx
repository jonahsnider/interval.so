'use client';

import posthog from 'posthog-js';
import { type PropsWithChildren, useEffect } from 'react';
import { trpc } from '../trpc/trpc-client';

export function PostHogIdentityProvider({ children }: PropsWithChildren) {
	const { data } = trpc.user.getSelf.useQuery();

	useEffect(() => {
		if (data?.user) {
			posthog.identify(data.user.id);
		} else {
			posthog.reset();
		}
	}, [data]);

	return children;
}
