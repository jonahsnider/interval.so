'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { type PropsWithChildren, useEffect } from 'react';

export function CsPostHogProvider({ children }: PropsWithChildren) {
	useEffect(() => {
		if (process.env.POSTHOG_KEY) {
			posthog.init(process.env.POSTHOG_KEY, {
				api_host: process.env.POSTHOG_HOST,
				person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
			});
		}
	}, []);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
