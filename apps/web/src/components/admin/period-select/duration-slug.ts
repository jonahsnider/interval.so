import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { type Duration, sub } from 'date-fns';
import type { SearchParams } from '../dashboard/search-params';

export enum DurationSlug {
	Last7Days = '7d',
	Last30Days = '30d',
	Last12Months = '12m',
	ThisYear = 'thisYear',
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

export function toTimeRange(searchParams: SearchParams): {
	current: TimeRangeSchema;
	previous?: TimeRangeSchema;
} {
	const { duration, start, end } = searchParams;

	if (duration === DurationSlug.Custom) {
		if (start && end) {
			return {
				current: {
					start,
					end,
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
			current: {
				start: new Date(now.getFullYear(), 0, 1),
				end: new Date(now.getFullYear() + 1, 0, 1),
			},
			previous: {
				start: new Date(now.getFullYear() - 1, 0, 1),
				end: new Date(now.getFullYear(), 0, 1),
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
