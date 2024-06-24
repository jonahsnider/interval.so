import { convert } from 'convert';
import type { TimeRangeSchema } from './time_range_schema.js';

export enum DatumPeriod {
	Daily = 'daily',
	Weekly = 'weekly',
	Monthly = 'monthly',
}

export function timeRangeToDatumPeriod(timeRange: TimeRangeSchema): DatumPeriod {
	const days = convert(timeRange.end.getTime() - timeRange.start.getTime(), 'milliseconds').to('days');

	if (days < 15) {
		return DatumPeriod.Daily;
	}

	if (days < 62) {
		return DatumPeriod.Weekly;
	}

	return DatumPeriod.Monthly;
}
