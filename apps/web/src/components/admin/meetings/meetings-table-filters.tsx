'use client';

import type { Table } from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useEffect, useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { searchParamParsers } from '../dashboard/search-params';
import { DurationSlug } from '../period-select/duration-slug';
import { PeriodSelect } from '../period-select/period-select';
import type { GlobalFilterValue, Meeting } from './columns';

type Props = {
	table: Table<Meeting>;
};

export function MeetingsTableFilters({ table }: Props) {
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

	useEffect(() => {
		const newGlobalFilter: GlobalFilterValue = { duration, start, end };
		table.setGlobalFilter(newGlobalFilter);
	}, [duration, start, end, table.setGlobalFilter]);

	return (
		<div>
			<PeriodSelect
				duration={duration}
				start={start ?? undefined}
				end={end ?? undefined}
				setDatesAndClearDuration={setDatesAndClearDuration}
				setDurationAndClearDates={setDurationAndClearDates}
			/>
		</div>
	);
}
