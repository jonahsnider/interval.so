import { Secret } from '@adonisjs/core/helpers';
import env from '#start/env';

export const postgresUrl = new Secret(env.get('POSTGRES_URL'));
