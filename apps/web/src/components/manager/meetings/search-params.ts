import { createSearchParamsCache, createSerializer, parseAsIsoDateTime, parseAsStringEnum } from 'nuqs/server';
import { DurationSlug } from '../period-select/duration-slug';

export const searchParamParsers = {
	duration: parseAsStringEnum(Object.values(DurationSlug))
		.withDefault(DurationSlug.Last7Days)
		.withOptions({ clearOnDefault: true }),
	start: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
	end: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),

	// The start and end date of the meeting for the current open dialog
	// Meetings don't have an ID since they're not a real construct, so we use this to identify them
	dialogStart: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
	dialogEnd: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
};
export const searchParamCache = createSearchParamsCache(searchParamParsers);
export const searchParamSerializer = createSerializer(searchParamParsers);

export type SearchParams = ReturnType<(typeof searchParamCache)['all']>;
