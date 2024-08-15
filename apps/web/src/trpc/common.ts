import getBaseApiUrl from '@/shared';
import type { AppRouterType } from '@interval.so/api/trpc_entry';
import { TRPCClientError } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const trpcUrl = new URL('/trpc', getBaseApiUrl());
export const trpcWsUrl = new URL('/trpc', getBaseApiUrl());

if (getBaseApiUrl().startsWith('https')) {
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
