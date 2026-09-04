import type { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { MeetingsTable } from '@/src/components/manager/meetings/meetings-table/meetings-table';
import { searchParamCache } from '@/src/components/manager/meetings/search-params';
import { toTimeFilter } from '@/src/components/manager/period-select/duration-slug';

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: Promise<SearchParams>;
};

async function ManagerMeetingsPageContent(props: Props) {
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

export default function ManagerMeetingsPage(props: Props) {
	return (
		<Suspense>
			<ManagerMeetingsPageContent {...props} />
		</Suspense>
	);
}
