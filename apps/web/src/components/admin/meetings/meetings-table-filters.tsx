'use client';

import type { Table } from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useEffect, useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { searchParamParsers } from '../dashboard/search-params';
import { DurationSlug, toTimeRange } from '../period-select/duration-slug';
import { PeriodSelect } from '../period-select/period-select';
import type { Meeting } from './columns';

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
		const timeRange = toTimeRange({ duration, start, end });

		table.getColumn('start')?.setFilterValue([timeRange.current.start, timeRange.current.end]);
		table.getColumn('end')?.setFilterValue([timeRange.current.start, timeRange.current.end]);
	}, [duration, start, end, table.getColumn]);

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
