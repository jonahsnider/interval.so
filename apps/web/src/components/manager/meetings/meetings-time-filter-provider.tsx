'use client';

import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import { useQueryStates } from 'nuqs';
import { createContext, type PropsWithChildren, use, useMemo } from 'react';
import { toTimeFilter } from '../period-select/duration-slug';
import { searchParamParsers } from './search-params';

const MeetingsTimeFilterContext = createContext<TimeFilterSchema | null>(null);

export function MeetingsTimeFilterProvider({ children }: PropsWithChildren) {
	const [{ duration, start, end }] = useQueryStates(searchParamParsers);
	// Resolve relative ranges once so the table and CSV export subscribe to identical inputs.
	const timeFilter = useMemo(() => toTimeFilter({ duration, start, end }), [duration, start, end]);
	return <MeetingsTimeFilterContext value={timeFilter}>{children}</MeetingsTimeFilterContext>;
}

export function useMeetingsTimeFilter() {
	const timeFilter = use(MeetingsTimeFilterContext);
	if (!timeFilter) throw new Error('useMeetingsTimeFilter requires MeetingsTimeFilterProvider');
	return timeFilter;
}
