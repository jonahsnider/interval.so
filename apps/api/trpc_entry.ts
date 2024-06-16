// Make tsc aware of the global interface changes made by Adonis's plugins
import './adonisrc.js';
import type { AppRouterType } from './app/routers/app_router.js';
export type { AppRouterType };
