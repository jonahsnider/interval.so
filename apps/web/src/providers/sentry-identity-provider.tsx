'use client';

import * as Sentry from '@sentry/react';
import { type PropsWithChildren, useEffect } from 'react';
import { trpc } from '../trpc/trpc-client';

export function SentryIdentityProvider({ children }: PropsWithChildren) {
	const { data } = trpc.user.getSelf.useQuery();

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
