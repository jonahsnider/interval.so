import { database, defineRailway, github, group, preserve, project, redis, service, volume } from 'railway/iac';

const GB = 1e9;

const region = 'us-west2';

export default defineRailway(() => {
	const cache = redis('Redis', { region });
	cache.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB, diskBytes: 50 * GB },
		},
	};
	const db = database('Postgres', 'postgres', {
		image: 'ghcr.io/railwayapp-templates/postgres-ssl:16',
		output: 'DATABASE_URL',
		defaultMountPath: '/var/lib/postgresql/data',
		region,
	});
	db.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB, diskBytes: 50 * GB },
		},
	};
	const cacheDisk = volume('Redis disk', {
		alerts: { usage: { '100': {}, '80': {}, '95': {} } },
		region: region,
		sizeMB: 50000,
	});
	const dbDisk = volume('Postgres disk', {
		alerts: { usage: { '100': {}, '80': {}, '95': {} } },
		region,
		sizeMB: 50000,
	});
	const intervalSo = service('interval.so', {
		source: github('jonahsnider/interval.so', { checkSuites: true }),
		build: 'pnpm --filter @interval.so/api build',
		start: 'node ./apps/api/build/bin/server.js',
		preDeploy: 'pnpm --filter @interval.so/api migrate:apply',
		healthcheck: '/health',
		healthcheckTimeout: 30,
		deploy: {
			restartPolicyType: 'ALWAYS',
			restartPolicyMaxRetries: 3,
			limitOverride: {
				containers: {
					cpu: 1,
					memoryBytes: 2 * GB,
				},
			},
		},
		domains: ['api.interval.so'],
		env: {
			APP_KEY: preserve(),
			COOKIE_DOMAIN: 'interval.so',
			NODE_ENV: 'production',
			POSTGRES_URL: db.env.DATABASE_URL,
			POSTHOG_HOST: 'https://us.i.posthog.com',
			POSTHOG_KEY: preserve(),
			REDIS_URL: cache.env.REDIS_URL,
			SENTRY_DSN_API: preserve(),
		},
	});
	const API = group('API', [cache, intervalSo, db]);

	return project('Interval', {
		resources: [cacheDisk, dbDisk, API],
	});
});
