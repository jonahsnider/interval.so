import { applySetCookies, getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// Remove with the API's Adonis session exchange, 90 days after the last old API instance stops issuing account sessions.
// Server Components cannot forward Set-Cookie to the browser, so exchange before rendering protected pages.
export async function proxy(request: NextRequest) {
	if (!request.cookies.has('adonis-session') || getSessionCookie(request.headers)) return NextResponse.next();
	const upstream = await fetch(new URL('/api/auth/get-session', process.env.NEXT_PUBLIC_API_URL), {
		headers: { cookie: request.headers.get('cookie') ?? '' },
		cache: 'no-store',
	});
	if (!upstream.ok) {
		throw new Error(
			`Unable to exchange the existing account session: API returned ${upstream.status} (${upstream.url})`,
		);
	}
	const setCookies = upstream.headers.getSetCookie();
	const headers = new Headers(request.headers);
	applySetCookies(headers, setCookies);
	const response = NextResponse.next({ request: { headers } });
	for (const cookie of setCookies) response.headers.append('set-cookie', cookie);
	response.headers.set('Cache-Control', 'private, no-store');
	return response;
}

export const config = {
	matcher: ['/((?!api|_next|__s|.*\\.[^/]+$).*)'],
};
