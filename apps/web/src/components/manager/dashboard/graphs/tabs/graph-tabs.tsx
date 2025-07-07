import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toTimeFilter, toTimeRange } from '../../../period-select/duration-slug';
import { searchParamCache } from '../../search-params';
import { AverageHoursGraph } from '../average-hours-graph/average-hours-graph.server';
import { UniqueMembersGraph } from '../unique-members-graph/unique-members-graph.server';
import { GraphTabTrigger } from './graph-tab-trigger';

export type GraphTab = 'members' | 'hours';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	selected: GraphTab;
};

export function GraphTabs({ team, selected }: Props) {
	const queryStates = searchParamCache.all();
	const timeRange = toTimeRange(queryStates);
	const timeFilter = toTimeFilter(queryStates);

	return (
		<Card>
			<div className='flex flex-col'>
				<CardHeader className='pt-0 px-0'>
					<div className='bg-secondary text-secondary-foreground border-b rounded-t-xl grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-x-auto'>
						<GraphTabTrigger
							active={selected === 'members'}
							tabId='members'
							team={team}
							timeFilters={{
								current: timeFilter,
								previous: timeRange.previous,
							}}
						/>

						<GraphTabTrigger
							active={selected === 'hours'}
							tabId='hours'
							team={team}
							timeFilters={{
								current: timeFilter,
								previous: timeRange.previous,
							}}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ErrorBoundary
						fallback={
							<div className='flex items-center justify-center h-96'>
								<p className='text-muted-foreground'>An error occurred while rendering this graph</p>
							</div>
						}
					>
						{selected === 'members' && <UniqueMembersGraph team={team} timeFilter={timeFilter} />}
						{selected === 'hours' && <AverageHoursGraph team={team} timeFilter={timeFilter} />}
					</ErrorBoundary>
				</CardContent>
			</div>
		</Card>
	);
}
