import { MeetingsTable } from '@/src/components/admin/meetings/meetings-table/meetings-table';
import { searchParamCache } from '@/src/components/admin/meetings/search-params';
import { toTimeRange } from '@/src/components/admin/period-select/duration-slug';
import type { SearchParams } from 'nuqs/parsers';

type Props = {
	params: {
		team: string;
	};
	searchParams: SearchParams;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminMeetingsPage({ params, searchParams }: Props) {
	const parsedSearchParams = searchParamCache.parse(searchParams);
	const { current: timeRange } = toTimeRange(parsedSearchParams);

	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MeetingsTable team={team} timeRange={timeRange} />
		</div>
	);
}
