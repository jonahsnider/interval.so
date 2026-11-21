import { drizzle } from 'drizzle-orm/postgres';
import { postgresUrl } from '#config/db';
import { relations } from '../../database/relations.ts';

export const db = drizzle(postgresUrl.release(), { relations });

export type Db = typeof db;
