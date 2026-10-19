import type { HttpContext } from '@adonisjs/core/http';

export function setAuthCookies(response: HttpContext['response'], headers: Headers): void {
	const cookies = headers.getSetCookie();
	if (cookies.length) {
		const existing = response.getHeader('set-cookie');
		response.header('set-cookie', [
			...(Array.isArray(existing) ? existing : existing ? [String(existing)] : []),
			...cookies,
		]);
	}
}
