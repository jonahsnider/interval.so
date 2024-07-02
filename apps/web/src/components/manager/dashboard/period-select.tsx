'use client';

import { useContext } from 'react';
import { PeriodSelect } from '../period-select/period-select';
import { ManagerDashboardContext } from './manager-dashboard-context';

export function ManagerDashboardPeriodSelect() {
	const { duration, setDatesAndClearDuration, setDurationAndClearDates, start, end } =
		useContext(ManagerDashboardContext);

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
