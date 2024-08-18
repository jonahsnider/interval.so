import type { ApplicationService } from '@adonisjs/core/types';
import { ph } from './analytics_service.js';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class AnalyticsProvider {
	constructor(protected app: ApplicationService) {}

	/**
	 * Register bindings to the container
	 */
	register() {}

	/**
	 * The container bindings have booted
	 */
	async boot() {}

	/**
	 * The application has been booted
	 */
	async start() {}

	/**
	 * The process has been started
	 */
	async ready() {}

	/**
	 * Preparing to shutdown the app
	 */
	async shutdown() {
		await ph.shutdown();
	}
}
