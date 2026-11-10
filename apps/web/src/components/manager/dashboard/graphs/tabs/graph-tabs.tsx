import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { TabsList } from '@radix-ui/react-tabs';
import { Card, CardHeader } from '@/components/ui/card';
import { AverageHoursGraph } from '../average-hours-graph/average-hours-graph.server';
import { UniqueMembersGraph } from '../unique-members-graph/unique-members-graph.server';
import { GraphTabPanels } from './graph-tab-panels';
import { GraphTabTrigger } from './graph-tab-trigger';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeFilter: TimeFilterSchema;
	timeRange: { current: TimeRangeSchema; previous?: TimeRangeSchema };
};

export function GraphTabs({ team, timeFilter, timeRange }: Props) {
	const timeFilters = { current: timeFilter, previous: timeRange.previous };
	const timeFilterKey = `${timeFilter.start.getTime()}:${timeFilter.end?.getTime() ?? ''}`;

	return (
		<Card>
			<GraphTabPanels
				members={<UniqueMembersGraph key={timeFilterKey} team={team} timeFilter={timeFilter} />}
				hours={<AverageHoursGraph key={timeFilterKey} team={team} timeFilter={timeFilter} />}
			>
				<CardHeader className='pt-0 px-0'>
					<TabsList
						aria-label='Dashboard charts'
						className='bg-secondary text-secondary-foreground border-b rounded-t-xl grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-x-auto'
					>
						<GraphTabTrigger tabId='members' team={team} timeFilters={timeFilters} />
						<GraphTabTrigger tabId='hours' team={team} timeFilters={timeFilters} />
					</TabsList>
				</CardHeader>
			</GraphTabPanels>
		</Card>
	);
}
