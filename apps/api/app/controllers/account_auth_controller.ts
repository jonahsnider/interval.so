import type { HttpContext } from '@adonisjs/core/http';
import { fromNodeHeaders } from 'better-auth/node';
import { accountAuth } from '../auth/account_auth.ts';
import { setAuthCookies } from '../auth/auth_response.ts';

// Account deletion and session revocation remain behind Interval's purpose-bound reauthentication.
const publicAuthPaths = new Set([
	'/passkey/generate-register-options',
	'/passkey/verify-registration',
	'/passkey/generate-authenticate-options',
	'/passkey/verify-authentication',
	'/get-session',
	'/sign-out',
	'/ok',
]);

export default class AccountAuthController {
	async index({ request, response, session }: HttpContext) {
		const path = request.url().slice('/api/auth'.length);
		if (!publicAuthPaths.has(path)) return response.notFound();
		const method = request.method();
		const result = await accountAuth.handler(
			new Request(new URL(request.completeUrl(true), accountAuth.options.baseURL as string), {
				method,
				headers: fromNodeHeaders(request.headers()),
				body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(request.body()),
			}),
		);
		setAuthCookies(response, result.headers);
		for (const [key, value] of result.headers) {
			if (key !== 'set-cookie') response.header(key, value);
		}
		if (result.ok && (path === '/passkey/verify-registration' || path === '/passkey/verify-authentication'))
			session.regenerate();
		response.status(result.status);
		return response.send(await result.text());
	}
}
