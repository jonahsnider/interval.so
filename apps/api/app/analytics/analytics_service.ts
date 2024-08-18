import { PostHog } from 'posthog-node';
import { postHogHost, postHogKey } from '#config/analytics';

/** PostHog client. */
export const ph = new PostHog(postHogKey.release(), {
	host: postHogHost,
});
