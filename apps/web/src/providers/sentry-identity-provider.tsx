'use client';

import * as Sentry from '@sentry/react';
import { type PropsWithChildren, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '../trpc/trpc-client';

export function SentryIdentityProvider({ children }: PropsWithChildren) {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.user.getSelf.queryOptions());

	useEffect(() => {
		Sentry.setUser(
			data?.user
				? {
						id: data.user.id,
						username: data.user.displayName,
					}
				: null,
		);
	}, [data]);

	return children;
}
