import { inject } from '@adonisjs/core';
import { router } from '#services/trpc_service';
import { injectHelper } from '../../util/inject_helper.js';
import { HelloWorldRouter } from './hello_world_router.js';

@inject()
@injectHelper(HelloWorldRouter)
export class AppRouter {
	constructor(private readonly helloWorldRouter: HelloWorldRouter) {}

	getRouter() {
		return router({
			helloWorld: this.helloWorldRouter.getRouter(),
		});
	}
}

export type AppRouterType = ReturnType<AppRouter['getRouter']>;
