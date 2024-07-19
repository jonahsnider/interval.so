import { UserTimezoneSchema } from '@interval.so/api/app/user/schemas/user_timezone_schema';

export function getTimezone(): UserTimezoneSchema {
	const raw = new Intl.DateTimeFormat().resolvedOptions().timeZone;

	const parsed = UserTimezoneSchema.safeParse(raw);

	if (parsed.success) {
		return parsed.data;
	}

	return 'UTC';
}
