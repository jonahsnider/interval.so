import { inject } from '@adonisjs/core';
import { injectHelper } from '../../util/inject_helper.js';
import { AuthRouter } from '../auth/auth_router.js';
import { router } from '../trpc/trpc_service.js';
import { UserRouter } from '../user/user_router.js';

@inject()
@injectHelper(AuthRouter, UserRouter)
export class AppRouter {
	constructor(
		private readonly authRouter: AuthRouter,
		private readonly userRouter: UserRouter,
	) {}

	getRouter() {
		return router({
			auth: this.authRouter.getRouter(),
			user: this.userRouter.getRouter(),
		});
	}
}

export type AppRouterType = ReturnType<AppRouter['getRouter']>;
