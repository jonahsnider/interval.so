import 'server-only';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { toTimeRange } from '../../../period-select/duration-slug';
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

	return (
		<Card>
			<div className='flex flex-col'>
				<CardHeader className='pt-0 px-0'>
					<div className='bg-muted/50 border-b rounded-t-xl flex overflow-x-auto'>
						<GraphTabTrigger active={selected === 'members'} tabId='members' team={team} timeRange={timeRange} />

						<GraphTabTrigger active={selected === 'hours'} tabId='hours' team={team} timeRange={timeRange} />
					</div>
				</CardHeader>
				<CardContent>
					{selected === 'members' && <UniqueMembersGraph team={team} timeRange={timeRange.current} />}
					{selected === 'hours' && <AverageHoursGraph team={team} timeRange={timeRange.current} />}
				</CardContent>
			</div>
		</Card>
	);
}
