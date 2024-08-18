import { Secret } from '@adonisjs/core/helpers';
import env from '#start/env';

export const postHogKey = new Secret(env.get('POSTHOG_KEY'));

export const postHogHost = env.get('POSTHOG_HOST');
