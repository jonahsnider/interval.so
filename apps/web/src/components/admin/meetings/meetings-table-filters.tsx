'use client';

import type { Table } from '@tanstack/react-table';
import { sub } from 'date-fns';
import { parseAsIsoDateTime, parseAsStringEnum, useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug, PeriodSelect, toDateFnsDuration } from '../period-select';
import type { Meeting } from './columns';

type Props = {
	table: Table<Meeting>;
};

export function MeetingsTableFilters({ table }: Props) {
	const [duration, setDuration] = useQueryState(
		'duration',
		parseAsStringEnum(Object.values(DurationSlug))
			.withDefault(DurationSlug.Last12Months)
			.withOptions({ clearOnDefault: true }),
	);
	const [start, setStart] = useQueryState('start', parseAsIsoDateTime.withOptions({ clearOnDefault: true }));
	const [end, setEnd] = useQueryState('end', parseAsIsoDateTime.withOptions({ clearOnDefault: true }));

	const setDurationAndClearDates = useMemo(
		() => (value: DurationSlug) => {
			setDuration(value);
			setStart(null);
			setEnd(null);
		},
		[setDuration, setStart, setEnd],
	);

	const setDatesAndClearDuration: SelectRangeEventHandler = useMemo(
		() => (event) => {
			setDuration(DurationSlug.Custom);
			setStart(event?.from ?? null);
			setEnd(event?.to ?? null);
		},
		[setDuration, setStart, setEnd],
	);

	useEffect(() => {
		// If we have a duration, turn that into a date
		// Otherwise, use the range they gave us

		let actualStart = start ?? undefined;
		let actualEnd = end ?? undefined;

		if (duration !== DurationSlug.Custom) {
			const offset = toDateFnsDuration(duration);
			actualStart = sub(new Date(), offset);
			actualEnd = new Date();
		}

		table.getColumn('start')?.setFilterValue([actualStart, actualEnd]);
		table.getColumn('end')?.setFilterValue([actualStart, actualEnd]);
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
