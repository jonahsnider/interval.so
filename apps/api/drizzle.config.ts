import assert from 'node:assert/strict';
import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (process.env.NODE_ENV === 'development') {
	config({ path: path.join(__dirname, '..', '..', '.env') });
}

const postgresUrl = process.env.POSTGRES_URL;

assert(postgresUrl, new TypeError('POSTGRES_URL environment variable was not set'));

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default defineConfig({
	schema: path.join('database', 'schema.ts'),
	dialect: 'postgresql',
	dbCredentials: {
		url: postgresUrl,
	},
	verbose: true,
	strict: true,
	out: path.join('database'),
});
