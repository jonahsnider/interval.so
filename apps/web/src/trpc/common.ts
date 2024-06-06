import getBaseApiUrl from '@/shared';
import type { AppRouterType } from '@hours.frc.sh/api/app/routers/app_router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const trpcUrl = new URL('/trpc', getBaseApiUrl());

export type RouterInput = inferRouterInputs<AppRouterType>;
export type RouterOutput = inferRouterOutputs<AppRouterType>;
