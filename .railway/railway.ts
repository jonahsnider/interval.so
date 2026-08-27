import { database, defineRailway, github, group, preserve, project, redis, service, volume } from 'railway/iac';

const GB = 1e9;

const region = 'us-west2';

export default defineRailway(() => {
	const Redis = redis('Redis', { region });
	Redis.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB, diskBytes: 100 * GB },
		},
	};
	const Postgres = database('Postgres', 'postgres', {
		image: 'ghcr.io/railwayapp-templates/postgres-ssl:16',
		output: 'DATABASE_URL',
		defaultMountPath: '/var/lib/postgresql/data',
		region,
	});
	Postgres.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB, diskBytes: 100 * GB },
		},
	};
	const RedisDisk = volume('Redis disk', {
		alerts: { usage: { '100': {}, '80': {}, '95': {} } },
		region: region,
		sizeMB: 50000,
	});
	const PostgresDisk = volume('Postgres disk', {
		alerts: { usage: { '100': {}, '80': {}, '95': {} } },
		region,
		sizeMB: 50000,
	});
	const intervalSo = service('interval.so', {
		source: github('jonahsnider/interval.so', { checkSuites: true }),
		build: {
			builder: 'RAILPACK',
			buildCommand: 'pnpm --filter @interval.so/api build',
		},
		start: 'node ./apps/api/build/bin/server.js',
		preDeploy: 'pnpm --filter @interval.so/api migrate:apply',
		healthcheck: '/health',
		healthcheckTimeout: 30,
		deploy: {
			runtime: 'V2',
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
		networking: { privateNetworkEndpoint: 'intervalso' },
		env: {
			APP_KEY: preserve(),
			COOKIE_DOMAIN: 'interval.so',
			NODE_ENV: 'production',
			POSTGRES_URL: Postgres.env.DATABASE_PUBLIC_URL,
			POSTHOG_HOST: 'https://us.i.posthog.com',
			POSTHOG_KEY: preserve(),
			REDIS_URL: Redis.env.REDIS_PUBLIC_URL,
			SENTRY_DSN_API: preserve(),
		},
	});
	const API = group('API', [Redis, intervalSo, Postgres]);

	return project('Interval', {
		resources: [RedisDisk, PostgresDisk, API],
	});
});
