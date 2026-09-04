import { inject } from '@adonisjs/core';
import { injectHelper } from '../../util/inject_helper.ts';
import { router } from '../trpc/trpc_service.ts';
import { AccountsRouter } from './accounts_router.ts';
import { GuestRouter } from './guest_router.ts';
import { TeamRouter } from './team_router.ts';
import { UserRouter } from './user_router.ts';

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
