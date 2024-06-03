import { inject } from '@adonisjs/core';
import { HelloWorldService } from '#services/hello_world_service';
import { publicProcedure, router } from '#services/trpc_service';
import { injectHelper } from '../../util/inject_helper.js';

@inject()
@injectHelper(HelloWorldService)
export class HelloWorldRouter {
	constructor(private readonly helloWorldService: HelloWorldService) {}

	getRouter() {
		return router({
			getHelloWorld: publicProcedure.query(() => {
				return this.helloWorldService.helloWorld();
			}),
		});
	}
}
