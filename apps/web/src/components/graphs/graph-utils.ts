import { DatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';

// biome-ignore lint/style/useNamingConvention: This is camelcase
export function formatXAxisDate(date: Date, period: DatumPeriod): string {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
	};

	if (period !== DatumPeriod.Monthly) {
		options.day = 'numeric';
	}

	if (date.getFullYear() !== now.getFullYear()) {
		options.year = 'numeric';
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}
