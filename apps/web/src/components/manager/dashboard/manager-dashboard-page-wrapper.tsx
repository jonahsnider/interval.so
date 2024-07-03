import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { toTimeFilter, toTimeRange } from '../period-select/duration-slug';
import { type GraphTab, GraphTabs } from './graphs/tabs/graph-tabs';
import { searchParamCache } from './search-params';
import { CombinedHoursTile } from './tiles/combined-hours-tile/combined-hours-tile.server';
import { LiveMemberCountTile } from './tiles/live-member-count-tile/live-member-count-tile.server';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	graphTab: GraphTab;
};

export function ManagerDashboardPageWrapper({ graphTab, team }: Props) {
	const searchParams = searchParamCache.all();

	const timeFilter = toTimeFilter(searchParams);
	const timeRange = toTimeRange(searchParams);

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
			<LiveMemberCountTile team={team} />
			<CombinedHoursTile
				team={team}
				durationSlug={searchParams.duration}
				currentTimeFilter={timeFilter}
				previousTimeFilter={timeRange.previous}
			/>

			<div className='col-span-full'>
				<GraphTabs team={team} selected={graphTab} />
			</div>
		</div>
	);
}
