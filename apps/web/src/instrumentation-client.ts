// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

Sentry.init({
	dsn: 'https://2665da63fbe57c625e3a9bf89556bd9b@o4507633464180736.ingest.us.sentry.io/4507548777840640',

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	dataCollection: {
		// To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
		// userInfo: false,
		// httpBodies: [],
	},
});

if (process.env.POSTHOG_KEY) {
	posthog.init(process.env.POSTHOG_KEY, {
		api_host: process.env.POSTHOG_HOST,
		person_profiles: 'identified_only',
	});
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
