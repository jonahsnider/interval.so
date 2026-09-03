import type { SearchParams } from 'nuqs';
import { MeetingsTable } from '@/src/components/manager/meetings/meetings-table/meetings-table';
import { searchParamCache } from '@/src/components/manager/meetings/search-params';
import { toTimeFilter } from '@/src/components/manager/period-select/duration-slug';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: Promise<SearchParams>;
};

export default async function ManagerMeetingsPage(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const parsedSearchParams = searchParamCache.parse(searchParams);
	const timeFilter = toTimeFilter(parsedSearchParams);

	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MeetingsTable team={team} timeFilter={timeFilter} />
		</div>
	);
}
