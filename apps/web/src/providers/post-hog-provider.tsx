'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { type PropsWithChildren, useEffect } from 'react';

export function CsPostHogProvider({ children }: PropsWithChildren) {
	useEffect(() => {
		if (!process.env.POSTHOG_KEY) {
			return;
		}

		const idleCallback = window.requestIdleCallback(
			() => {
				if (!posthog.__loaded) {
					posthog.init(process.env.POSTHOG_KEY!, {
						api_host: process.env.POSTHOG_HOST,
						person_profiles: 'identified_only',
					});
				}
			},
			{ timeout: 2_000 },
		);

		return () => window.cancelIdleCallback(idleCallback);
	}, []);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
