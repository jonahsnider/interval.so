'use client';

import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { searchParamParsers } from '../../dashboard/search-params';
import { DurationSlug } from '../../period-select/duration-slug';
import { PeriodSelect } from '../../period-select/period-select';

export function MeetingsTableFilters() {
	const [{ duration, end, start }, setQuery] = useQueryStates(searchParamParsers);

	const setDurationAndClearDates = useMemo(
		() => (value: DurationSlug) => {
			setQuery({ duration: value, start: null, end: null });
		},
		[setQuery],
	);

	const setDatesAndClearDuration: SelectRangeEventHandler = useMemo(
		() => (event) => {
			setQuery({
				duration: DurationSlug.Custom,
				start: event?.from ?? null,
				end: event?.to ?? null,
			});
		},
		[setQuery],
	);

	return (
		<div className='flex items-center justify-end'>
			<PeriodSelect
				duration={duration}
				start={start ?? undefined}
				end={end ?? undefined}
				setDatesAndClearDuration={setDatesAndClearDuration}
				setDurationAndClearDates={setDurationAndClearDates}
				className='max-w-min'
				align='end'
			/>
		</div>
	);
}
