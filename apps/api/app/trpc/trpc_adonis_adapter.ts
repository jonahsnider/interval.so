import { Readable } from 'node:stream';
import type { HttpContext } from '@adonisjs/core/http';
import type { AnyTRPCRouter, inferRouterContext } from '@trpc/server';
import { incomingMessageToRequest } from '@trpc/server/adapters/node-http';
import { resolveResponse, type TRPCRequestInfo } from '@trpc/server/http';
import type { HTTPErrorHandler, MaybePromise } from '@trpc/server/unstable-core-do-not-import';

export type CreateAdonisContextOptions = {
	context: HttpContext;
	info: TRPCRequestInfo;
};

export type AdonisContextFn<TRouter extends AnyTRPCRouter> = (
	opts: CreateAdonisContextOptions,
) => MaybePromise<inferRouterContext<TRouter>>;

function normalizePrefix(prefix: string): string {
	// Add leading and trailing slash

	let result = prefix;

	if (!result.startsWith('/')) {
		result = `/${result}`;
	}

	if (!result.endsWith('/')) {
		result = `${result}/`;
	}

	return result;
}

export type TrpcHandlerAdonis = (context: HttpContext) => Promise<void>;

export function createTrpcHandlerAdonis<TRouter extends AnyTRPCRouter>(options: {
	router: TRouter;
	prefix: string;
	createContext: AdonisContextFn<TRouter>;
	onError?: HTTPErrorHandler<TRouter, Request>;
}): TrpcHandlerAdonis {
	const { router, prefix: rawPrefix, createContext } = options;

	const actualPrefix = normalizePrefix(rawPrefix);

	return async (context: HttpContext) => {
		const { request, response } = context;

		const path = request.url().slice(actualPrefix.length);

		// @ts-expect-error TRPC's incomingMessageToRequest() expects a body property, which doesn't match the IncomingMessage interface
		// If you don't do this, TRPC will attempt to load the body stream but for whatever reason that will just take forever instead of returning an actual response
		request.request.body = request.hasBody() ? request.body() : '';

		const trpcResponse = await resolveResponse({
			router,
			path,
			req: incomingMessageToRequest(request.request, response.response, { maxBodySize: null }),
			createContext({ info }) {
				return createContext({ context, info });
			},
			error: null,
			onError: options.onError,
		});

		for (const [headerKey, headerValue] of trpcResponse.headers) {
			response.header(headerKey, headerValue);
		}

		response.status(trpcResponse.status);

		if (trpcResponse.body !== null) {
			// @ts-ignore Sometimes this acts like iterables don't exist, other times it doesn't
			response.stream(Readable.fromWeb(trpcResponse.body));
		}
	};
}
