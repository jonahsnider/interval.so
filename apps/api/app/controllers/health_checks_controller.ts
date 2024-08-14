import type { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import { healthChecks } from '#start/health';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class HealthChecksController {
	async handle({ response }: HttpContext) {
		const report = await healthChecks.run();

		if (report.isHealthy) {
			return response.ok({ status: report.status });
		}

		logger.error('Health check failed: %o', report);

		return response.serviceUnavailable({ status: report.status });
	}
}
