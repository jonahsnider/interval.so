import assert from 'node:assert/strict';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

const postgresUrl = process.env.POSTGRES_URL;

assert(postgresUrl, new TypeError('POSTGRES_URL environment variable was not set'));

export default defineConfig({
	schema: path.join('database', 'schema.ts'),
	dialect: 'postgresql',
	dbCredentials: {
		url: postgresUrl,
	},
	verbose: true,
	out: path.join('database'),
});
