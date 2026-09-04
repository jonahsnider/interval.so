// Make tsc aware of the global interface changes made by Adonis's plugins
import type {} from './adonisrc.ts';
import type { AppRouterType } from './app/routers/app_router.ts';

export type { AppRouterType };
