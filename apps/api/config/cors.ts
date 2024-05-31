import { defineConfig } from '@adonisjs/cors';

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
	enabled: true,
	origin: true,
	methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
	headers: true,
	exposeHeaders: [],
	credentials: true,
	maxAge: 90,
});

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default corsConfig;
