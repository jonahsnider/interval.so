'use client';

import type { UserTimezoneSchema } from '@hours.frc.sh/api/app/user/schemas/user_timezone_schema';
import { useEffect, useState } from 'react';
import { getTimezone } from '../utils/timezone-util';

export function useTimezone(): UserTimezoneSchema {
	const [timezone, setTimezone] = useState<UserTimezoneSchema>(getTimezone());

	useEffect(() => {
		setTimezone(getTimezone());
	}, []);

	return timezone;
}
