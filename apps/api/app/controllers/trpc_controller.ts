import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import { injectHelper } from '../../util/inject_helper.js';
import { AppRouter } from '../routers/app_router.js';
import { type TrpcHandlerAdonis, createTrpcHandlerAdonis } from '../trpc_adonis_adapter.js';

@inject()
@injectHelper(AppRouter)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TrpcController {
	private readonly handler: TrpcHandlerAdonis;

	constructor(appRouter: AppRouter) {
		this.handler = createTrpcHandlerAdonis({
			router: appRouter.getRouter(),
			prefix: '/trpc',
			createContext() {
				return {};
			},
		});
	}

	async index(context: HttpContext) {
		await this.handler(context);
	}
}
