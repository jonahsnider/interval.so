import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class SessionCookieMiddleware {
	handle({ request, response, session }: HttpContext, next: NextFn) {
		const { cookieName, cookie } = session.config;

		if (cookie.domain && request.hostname() !== cookie.domain.replace(/^\./, '')) {
			// Older configurations issued host-only cookies with this same name. They
			// can shadow the shared cookie, causing session renewal to change IDs between
			// passkey options and verification ("No challenge found").
			// Remove only once all configurations serving this hostname use the shared
			// domain and the longest previous cookie lifetime (formerly 3 months) has
			// elapsed since a host-only cookie could last have been issued or refreshed.
			response.clearCookie(cookieName, { ...cookie, domain: '' });
		}

		return next();
	}
}
