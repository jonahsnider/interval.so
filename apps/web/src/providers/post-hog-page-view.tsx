// app/PostHogPageView.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

function RawPostHogPageView(): undefined {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();
	useEffect(() => {
		// Track pageviews
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url += `?${searchParams.toString()}`;
			}
			posthog.capture('$pageview', {
				// biome-ignore lint/style/useNamingConvention: This can't be renamed
				$current_url: url,
			});
		}
	}, [pathname, searchParams, posthog]);
}

export function PostHogPageView() {
	return (
		<Suspense>
			<RawPostHogPageView />
		</Suspense>
	);
}
