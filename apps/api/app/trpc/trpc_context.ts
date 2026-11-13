import type { Session } from '@adonisjs/session';
import { fromNodeHeaders } from 'better-auth/node';
import type { AccountSession } from '../auth/create_account_auth.ts';
import { setAuthCookies } from '../auth/auth_response.ts';
import type { CreateAdonisContextOptions } from './trpc_adonis_adapter.ts';
import { type Actor, getActor } from '../authorization/authorization.ts';

type TrpcContext = {
	actor: Actor;
	session: Session;
	account: AccountSession | null;
	authHeaders: Headers;
	setAuthCookies: (headers: Headers) => void;
	validateSession?: () => Promise<void>;
};

export function createHttpContext({ context }: CreateAdonisContextOptions): TrpcContext {
	return {
		actor: getActor(context.session, context.account),
		session: context.session,
		account: context.account,
		authHeaders: fromNodeHeaders(context.request.headers()),
		setAuthCookies: (headers) => setAuthCookies(context.response, headers),
	};
}
