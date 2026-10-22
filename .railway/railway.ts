import { defineRailway, github, group, image, postgres, preserve, project, redis, service, volume } from 'railway/iac';

const GB = 1e9;

const region = 'us-west2';

export default defineRailway(() => {
	const cache = redis('Redis', { region });
	cache.variables = {
		RAILWAY_RUN_AS_ROOT: preserve(),
		RAILWAY_RUN_UID: preserve(),
		REDISHOST: preserve(),
		REDISPASSWORD: preserve(),
		REDISPORT: preserve(),
		REDISUSER: preserve(),
		REDIS_PASSWORD: preserve(),
		REDIS_PUBLIC_URL: preserve(),
		REDIS_URL: preserve(),
	};
	cache.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB },
		},
	};
	const db = postgres('Postgres', { region });
	// Keep the existing major version; postgres() defaults to Postgres 18.
	db.image = 'ghcr.io/railwayapp-templates/postgres-ssl:16';
	db.source = image(db.image);
	db.variables = {
		DATABASE_PUBLIC_URL: preserve(),
		DATABASE_URL: preserve(),
		PGDATA: preserve(),
		PGDATABASE: preserve(),
		PGHOST: preserve(),
		PGPASSWORD: preserve(),
		PGPORT: preserve(),
		PGUSER: preserve(),
		POSTGRES_DB: preserve(),
		POSTGRES_PASSWORD: preserve(),
		POSTGRES_USER: preserve(),
		SSL_CERT_DAYS: preserve(),
	};
	db.deploy = {
		limitOverride: {
			containers: { cpu: 1, memoryBytes: 1 * GB },
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
	cache.volumeAttachments = {
		[cacheDisk.name]: { volume: cacheDisk.address, mountPath: '/bitnami' },
	};
	db.volumeAttachments = {
		[dbDisk.name]: { volume: dbDisk.address, mountPath: '/var/lib/postgresql/data' },
	};
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
				containers: { cpu: 1, memoryBytes: 2 * GB },
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
