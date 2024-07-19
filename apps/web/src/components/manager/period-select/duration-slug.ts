import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { type Duration, endOfDay, endOfYear, startOfDay, startOfYear, sub } from 'date-fns';

export enum DurationSlug {
	Last7Days = '7d',
	Last30Days = '30d',
	Last12Months = '12m',
	ThisYear = 'ytd',
	Custom = 'custom',
}
const DURATIONS = {
	[DurationSlug.Last7Days]: 'Last 7 days',
	[DurationSlug.Last30Days]: 'Last 30 days',
	[DurationSlug.Last12Months]: 'Last 12 months',
	[DurationSlug.ThisYear]: 'This year',
	[DurationSlug.Custom]: undefined,
} as const;

export function durationLabel(duration: DurationSlug): string | undefined {
	return DURATIONS[duration];
}

export function durationLabelPreviousPeriod(duration: DurationSlug): string | undefined {
	if (duration === DurationSlug.ThisYear) {
		return 'Last year';
	}

	return durationLabel(duration);
}

export function toTimeFilter(searchParams: {
	duration: DurationSlug;
	start?: Date | null;
	end?: Date | null;
}): TimeFilterSchema {
	const timeRange = toTimeRange(searchParams);

	if (searchParams.duration === DurationSlug.Custom) {
		return timeRange.current;
	}

	return {
		start: timeRange.current.start,
	};
}

export function toTimeRange(searchParams: {
	duration: DurationSlug;
	start?: Date | null;
	end?: Date | null;
}): {
	current: TimeRangeSchema;
	previous?: TimeRangeSchema;
} {
	const { duration, start, end } = searchParams;

	if (duration === DurationSlug.Custom) {
		if (start && end) {
			return {
				current: {
					start: startOfDay(start),
					end: endOfDay(end),
				},
				previous: undefined,
			};
		}

		// Default to last 7 days if the query parameters are in an invalid state
		return toTimeRange({ duration: DurationSlug.Last7Days, start: null, end: null });
	}

	const now = new Date();

	if (duration === DurationSlug.ThisYear) {
		return {
			// Year to date
			current: {
				start: startOfYear(now),
				// If we used the end of the year, there would be a bunch of data from all 0s from [now, endOfYear(now)]
				// Which looks ugly. So we can just query up until now and then it only has existing data in the result
				end: now,
			},
			// Entire last year
			previous: {
				start: startOfYear(new Date(now.getFullYear() - 1, 0, 1)),
				end: endOfYear(new Date(now.getFullYear() - 1, 0, 1)),
			},
		};
	}

	let dateFnsDuration: Duration = {};

	switch (duration) {
		case DurationSlug.Last7Days:
			dateFnsDuration = { days: 7 };
			break;
		case DurationSlug.Last30Days:
			dateFnsDuration = { days: 30 };
			break;
		case DurationSlug.Last12Months:
			dateFnsDuration = { months: 12 };
			break;
	}

	return {
		current: {
			start: sub(now, dateFnsDuration),
			end: now,
		},
		previous: {
			// Kinda evil way to subtract `duration * 2`
			start: sub(sub(now, dateFnsDuration), dateFnsDuration),
			end: sub(now, dateFnsDuration),
		},
	};
}
