'use client';

import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import type { Table } from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { searchParamParsers } from '../../dashboard/search-params';
import { DurationSlug } from '../../period-select/duration-slug';
import { PeriodSelect } from '../../period-select/period-select';

type Props = {
	table: Table<TeamMeetingSchema>;
};

export function MeetingsTableFilters({ table }: Props) {
	const [{ duration, end, start }, setQuery] = useQueryStates(searchParamParsers);

	const setDurationAndClearDates = useMemo(
		() => (value: DurationSlug) => {
			setQuery({ duration: value, start: null, end: null }, { shallow: false });
		},
		[setQuery],
	);

	const setDatesAndClearDuration: SelectRangeEventHandler = useMemo(
		() => (event) => {
			setQuery(
				{
					duration: DurationSlug.Custom,
					start: event?.from ?? null,
					end: event?.to ?? null,
				},
				{ shallow: false },
			);
		},
		[setQuery],
	);

	return (
		<PeriodSelect
			duration={duration}
			start={start ?? undefined}
			end={end ?? undefined}
			setDatesAndClearDuration={setDatesAndClearDuration}
			setDurationAndClearDates={setDurationAndClearDates}
			className='max-w-min'
		/>
	);
}
