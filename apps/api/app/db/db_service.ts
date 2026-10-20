import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { postgresUrl } from '#config/db';
import { relations } from '../../database/relations.ts';

const connection = postgres(postgresUrl.release());
export const db = drizzle({
	client: connection,
	relations,
});

export type Db = typeof db;
