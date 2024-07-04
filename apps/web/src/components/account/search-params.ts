import { createSearchParamsCache, createSerializer, parseAsString } from 'nuqs/server';

export const searchParamParsers = {
	invite: parseAsString.withOptions({ clearOnDefault: true }),
};
export const searchParamCache = createSearchParamsCache(searchParamParsers);
export const searchParamSerializer = createSerializer(searchParamParsers);

export type SearchParams = ReturnType<(typeof searchParamCache)['all']>;
