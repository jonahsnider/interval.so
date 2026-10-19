import type { Session } from '@adonisjs/session';
import { fromNodeHeaders } from 'better-auth/node';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import type { AccountSession } from '../auth/create_account_auth.ts';
import { setAuthCookies } from '../auth/auth_response.ts';
import type { CreateAdonisContextOptions } from './trpc_adonis_adapter.ts';

type TrpcContext = {
	bouncer: AppBouncer;
	session: Session;
	account: AccountSession | null;
	authHeaders: Headers;
	setAuthCookies: (headers: Headers) => void;
	validateSession?: () => Promise<void>;
};

export function createHttpContext({ context }: CreateAdonisContextOptions): TrpcContext {
	return {
		bouncer: context.bouncer,
		session: context.session,
		account: context.account,
		authHeaders: fromNodeHeaders(context.request.headers()),
		setAuthCookies: (headers) => setAuthCookies(context.response, headers),
	};
}
