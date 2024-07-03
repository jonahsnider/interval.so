import { convert } from 'convert';
import type { TimeFilterSchema } from './time_filter_schema.js';
import type { TimeRangeSchema } from './time_range_schema.js';

export enum DatumPeriod {
	Daily = 'daily',
	Weekly = 'weekly',
	Monthly = 'monthly',
}

export function timeFilterToDatumPeriod(timeFilter: TimeFilterSchema | TimeRangeSchema): DatumPeriod {
	// Act as though the time filter had ended now if it didn't have an end time included
	const endTime = timeFilter.end ?? new Date();
	const days = convert(endTime.getTime() - timeFilter.start.getTime(), 'milliseconds').to('days');

	if (days < 15) {
		return DatumPeriod.Daily;
	}

	if (days < 62) {
		return DatumPeriod.Weekly;
	}

	return DatumPeriod.Monthly;
}
