import { inject } from '@adonisjs/core';
import { injectHelper } from '../../util/inject_helper.js';
import { router } from '../trpc/trpc_service.js';
import { AccountsRouter } from './accounts_router.js';
import { GuestRouter } from './guest_router.js';
import { TeamRouter } from './team_router.js';
import { UserRouter } from './user_router.js';

@inject()
@injectHelper(AccountsRouter, UserRouter, TeamRouter, GuestRouter)
export class AppRouter {
	constructor(
		private readonly accountsRouter: AccountsRouter,
		private readonly userRouter: UserRouter,
		private readonly teamRouter: TeamRouter,
		private readonly guestRouter: GuestRouter,
	) {}

	getRouter() {
		return router({
			accounts: this.accountsRouter.getRouter(),
			user: this.userRouter.getRouter(),
			teams: this.teamRouter.getRouter(),
			guestLogin: this.guestRouter.getRouter(),
		});
	}
}

export type AppRouterType = ReturnType<AppRouter['getRouter']>;
