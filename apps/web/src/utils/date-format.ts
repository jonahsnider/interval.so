import { capitalize, multiReplace } from '@jonahsnider/util';
import {
	type Duration,
	add,
	formatDistance as formatDistanceDateFns,
	formatRelative,
	isWithinInterval,
	sub,
} from 'date-fns';

export function formatDate(date: Date, precise = false): string {
	const now = new Date();

	// If date is plus/minus 6 days from now, format with relative time
	if (!precise && within7Days(date)) {
		return capitalize(formatRelative(date, now));
	}

	const options: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: 'numeric',
		timeZoneName: 'short',
	};

	if (date.getMonth() !== now.getMonth() || date.getDate() !== now.getDate()) {
		options.month = 'short';
		options.day = 'numeric';
	}

	if (date.getFullYear() !== now.getFullYear()) {
		options.year = 'numeric';
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}

function within7Days(date: Date) {
	const now = new Date();

	return isWithinInterval(date, {
		start: sub(now, { days: 6 }),
		end: add(now, { days: 6 }),
	});
}

/**
 * Format a date range in the most concise way possible, and if the range was within ±7 days, format it relative to now.
 */
export function formatDateRange(start: Date, end?: Date, verbose = false): string {
	const now = new Date();

	const options: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: 'numeric',
		timeZoneName: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	};

	if (new Set([start.getFullYear(), (end ?? now).getFullYear(), now.getFullYear()]).size === 1) {
		options.year = undefined;
	}

	if (new Set([start.getMinutes(), end ? end.getMinutes() : 0, 0]).size === 1) {
		options.minute = undefined;
	}

	let prefix = '';

	if (!verbose && within7Days(start) && (!end || within7Days(end))) {
		options.month = undefined;
		options.day = undefined;
		prefix = capitalize(formatRelative(start, now).replace(/ at .+$/, ', '));
	}

	const formatter = new Intl.DateTimeFormat('en-US', options);

	const formatted = multiReplace(prefix + formatter.formatRange(start, end ?? new Date()), {
		'\u2009': ' ',
		'\u2013': '-',
	});

	if (!end) {
		return formatted.replace(/ - .+$/, ' - now');
	}

	return formatted;
}

export function formatDistance(start: Date, end: Date): string {
	return capitalize(formatDistanceDateFns(start, end));
}

export function formatDuration(duration: Duration): string {
	return formatDistance(sub(new Date(), duration), new Date());
}
