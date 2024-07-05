import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { injectHelper } from '../../util/inject_helper.js';
import { AppRouter } from '../routers/app_router.js';
import { type TrpcHandlerAdonis, createTrpcHandlerAdonis } from './trpc_adonis_adapter.js';
import { createHttpContext } from './trpc_context.js';

@inject()
@injectHelper(AppRouter)
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class TrpcController {
	private readonly handler: TrpcHandlerAdonis;

	constructor(appRouter: AppRouter) {
		this.handler = createTrpcHandlerAdonis({
			router: appRouter.getRouter(),
			prefix: '/trpc',
			createContext: createHttpContext,
			onError(options) {
				if (options.error.code === 'INTERNAL_SERVER_ERROR') {
					// Log error and have tRPC respond like normal
					logger.error(options.error);
					// TODO: Log to Sentry

					options.error.message = 'Internal server error';
					options.error.stack = undefined;
				}

				// Use default TRPC error response for client errors
			},
		});
	}

	async index(context: HttpContext) {
		await this.handler(context);
	}
}
