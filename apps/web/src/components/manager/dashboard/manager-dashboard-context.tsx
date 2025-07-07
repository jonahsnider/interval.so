'use client';

import { useQueryStates } from 'nuqs';
import { createContext, type PropsWithChildren, useMemo } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug } from '../period-select/duration-slug';
import { searchParamParsers } from './search-params';

type ContextValue = {
	duration: DurationSlug;
	start?: Date;
	end?: Date;

	setDurationAndClearDates: (value: DurationSlug) => void;
	setDatesAndClearDuration: SelectRangeEventHandler;
};

export const ManagerDashboardContext = createContext<ContextValue>({
	duration: DurationSlug.Last7Days,
	setDatesAndClearDuration: () => {},
	setDurationAndClearDates: () => {},
});

export function ManagerDashboardProvider({ children }: PropsWithChildren) {
	const [{ duration, end, start }, setQuery] = useQueryStates(searchParamParsers);

	const setDurationAndClearDates = useMemo(
		() => (value: DurationSlug) => {
			setQuery({ duration: value, start: null, end: null });
		},
		[setQuery],
	);

	const setDatesAndClearDuration: SelectRangeEventHandler = useMemo(
		() => (event) => {
			setQuery({ duration: DurationSlug.Custom, start: event?.from ?? null, end: event?.to ?? null });
		},
		[setQuery],
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

	return <ManagerDashboardContext.Provider value={contextValue}>{children}</ManagerDashboardContext.Provider>;
}
