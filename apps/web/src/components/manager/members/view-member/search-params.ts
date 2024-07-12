import { createSearchParamsCache, createSerializer, parseAsIsoDateTime, parseAsStringEnum } from 'nuqs/server';
import { DurationSlug } from '../../period-select/duration-slug';

export const searchParamParsers = {
	duration: parseAsStringEnum(Object.values(DurationSlug))
		.withDefault(DurationSlug.Last7Days)
		.withOptions({ clearOnDefault: true }),
	start: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
	end: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
};
export const searchParamCache = createSearchParamsCache(searchParamParsers);
export const searchParamSerializer = createSerializer(searchParamParsers);

export type SearchParams = ReturnType<(typeof searchParamCache)['all']>;
