import getBaseApiUrl from '@/shared';
import type { AppRouterType } from '@hours.frc.sh/api/trpc_entry';
import { TRPCClientError } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const trpcUrl = new URL('/trpc', getBaseApiUrl());

export type RouterInput = inferRouterInputs<AppRouterType>;
export type RouterOutput = inferRouterOutputs<AppRouterType>;

export function isTrpcClientError(cause: unknown): cause is TRPCClientError<AppRouterType> {
	return cause instanceof TRPCClientError;
}

export type { AppRouterType };
