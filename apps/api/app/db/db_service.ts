import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { postgresUrl } from '#config/db';
import * as relations from '../../database/relations.js';
import * as schema from '../../database/schema.js';

const connection = postgres(postgresUrl.release());
export const db = drizzle(connection, {
	schema: { ...schema, ...relations },
});

export type Db = typeof db;
