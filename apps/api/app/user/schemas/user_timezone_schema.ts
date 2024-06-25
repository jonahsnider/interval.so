import { z } from 'zod';

// Timezones exported from Postgres via https://stackoverflow.com/a/66318000/10808983

import type { NonEmptyArray } from '@jonahsnider/util';
import { POSTGRES_TIMEZONES } from './postgres_timezones.js';

const timezoneNames = POSTGRES_TIMEZONES.map((timezone) => timezone.name) as NonEmptyArray<string>;

export const UserTimezoneSchema = z.enum(timezoneNames);
export type UserTimezoneSchema = z.infer<typeof UserTimezoneSchema>;

export { POSTGRES_TIMEZONES };
