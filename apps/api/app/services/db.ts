import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { postgresUrl } from '#config/db';
import type { DB } from '../../types/db.js';

const dialect = new PostgresDialect({
	pool: new pg.Pool({ connectionString: postgresUrl.release() }),
});

export const db = new Kysely<DB>({
	dialect,
});
