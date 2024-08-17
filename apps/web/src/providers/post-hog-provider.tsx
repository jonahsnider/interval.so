'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { type PropsWithChildren, useEffect } from 'react';

export function CsPostHogProvider({ children }: PropsWithChildren) {
	useEffect(() => {
		if (process.env.POSTHOG_KEY) {
			posthog.init(process.env.POSTHOG_KEY, {
				// biome-ignore lint/style/useNamingConvention: This can't be renamed
				api_host: process.env.POSTHOG_HOST,
				// biome-ignore lint/style/useNamingConvention: This can't be renamed
				person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
			});
		}
	}, []);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
