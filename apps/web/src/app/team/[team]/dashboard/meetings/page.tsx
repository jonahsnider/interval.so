import { MeetingsTable } from '@/src/components/manager/meetings/meetings-table/meetings-table';
import { searchParamCache } from '@/src/components/manager/meetings/search-params';
import { toTimeFilter } from '@/src/components/manager/period-select/duration-slug';
import type { SearchParams } from 'nuqs/parsers';

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: SearchParams;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
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
