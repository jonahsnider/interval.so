'use client';

import { useContext } from 'react';
import { PeriodSelect } from '../period-select';
import { AdminDashboardContext } from './admin-dashboard-context';

export function AdminDashboardPeriodSelect() {
	const { duration, setDatesAndClearDuration, setDurationAndClearDates, start, end } =
		useContext(AdminDashboardContext);

	return (
		<PeriodSelect
			duration={duration}
			start={start}
			end={end}
			setDatesAndClearDuration={setDatesAndClearDuration}
			setDurationAndClearDates={setDurationAndClearDates}
		/>
	);
}
