'use client';

import { useQueryStates } from 'nuqs';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug } from '../../../period-select/duration-slug';
import { PeriodSelect } from '../../../period-select/period-select';
import { searchParamParsers } from '../search-params';

export function TimeFilterPicker() {
	const [searchParams, setSearchParams] = useQueryStates(searchParamParsers);

	const setDatesAndClearDuration: SelectRangeEventHandler = (event) => {
		setSearchParams({
			duration: DurationSlug.Custom,
			start: event?.from ?? null,
			end: event?.to ?? null,
		});
	};

	const setDurationAndClearDates = (duration: DurationSlug) => {
		setSearchParams({ duration, start: null, end: null });
	};

	return (
		<PeriodSelect
			className='w-full xs:max-w-min'
			duration={searchParams.duration}
			start={searchParams.start ?? undefined}
			end={searchParams.end ?? undefined}
			setDatesAndClearDuration={setDatesAndClearDuration}
			setDurationAndClearDates={setDurationAndClearDates}
		/>
	);
}
