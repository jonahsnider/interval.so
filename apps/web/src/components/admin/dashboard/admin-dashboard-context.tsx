'use client';

import { parseAsIsoDateTime, parseAsStringEnum, useQueryState } from 'nuqs';
import { type PropsWithChildren, createContext, useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug } from '../period-select';

type ContextValue = {
	duration: DurationSlug;
	start?: Date;
	end?: Date;

	setDurationAndClearDates: (value: DurationSlug) => void;
	setDatesAndClearDuration: SelectRangeEventHandler;
};

export const AdminDashboardContext = createContext<ContextValue>({
	duration: DurationSlug.Last7Days,
	setDatesAndClearDuration: () => {},
	setDurationAndClearDates: () => {},
});

export function AdminDashboardProvider({ children }: PropsWithChildren) {
	const [duration, setDuration] = useQueryState(
		'duration',
		parseAsStringEnum(Object.values(DurationSlug))
			.withDefault(DurationSlug.Last7Days)
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

	const contextValue = useMemo(
		() => ({
			duration,
			start: start ?? undefined,
			end: end ?? undefined,
			setDurationAndClearDates,
			setDatesAndClearDuration,
		}),
		[duration, start, end, setDurationAndClearDates, setDatesAndClearDuration],
	);

	return <AdminDashboardContext.Provider value={contextValue}>{children}</AdminDashboardContext.Provider>;
}
