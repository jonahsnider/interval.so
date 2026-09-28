import type { AppRouterType } from '@interval.so/api/trpc_entry';
import { TRPCClientError } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
	throw new TypeError('NEXT_PUBLIC_API_URL must be set');
}

export const trpcUrl = new URL('/trpc', apiUrl);
export const trpcWsUrl = new URL('/trpc', apiUrl);

if (apiUrl.startsWith('https')) {
	trpcWsUrl.protocol = 'wss';
} else {
	trpcWsUrl.protocol = 'ws';
}

export type RouterInput = inferRouterInputs<AppRouterType>;
export type RouterOutput = inferRouterOutputs<AppRouterType>;

export function isTrpcClientError(cause: unknown): cause is TRPCClientError<AppRouterType> {
	return cause instanceof TRPCClientError;
}

export type { AppRouterType };
