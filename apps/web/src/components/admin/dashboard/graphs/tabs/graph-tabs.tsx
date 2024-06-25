import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { toTimeRange } from '../../../period-select/duration-slug';
import { searchParamCache, searchParamSerializer } from '../../search-params';
import { AverageHoursGraph } from '../average-hours-graph';
import { UniqueMembersGraph } from '../unique-members-graph/unique-members-graph';
import { GraphTabTrigger } from './graph-tab-trigger';

export type GraphTab = 'members' | 'hours';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	selected: GraphTab;
};

export function GraphTabs({ team, selected }: Props) {
	const queryStates = searchParamCache.all();
	const queryString = searchParamSerializer(queryStates);

	const createHref = (subpath: string) => `/team/${team.slug}/admin${subpath}${queryString}`;

	const timeRange = toTimeRange(queryStates);

	return (
		<Card>
			<div className='flex flex-col'>
				<CardHeader className='pt-0 px-0'>
					<div className='bg-muted/50 border-b rounded-t-xl flex overflow-x-auto'>
						<GraphTabTrigger
							active={selected === 'members'}
							title='Members'
							measure={28}
							trend={0.2}
							href={createHref('')}
						/>

						<GraphTabTrigger
							active={selected === 'hours'}
							title='Average hours'
							measure={5.7}
							trend={-0.13}
							href={createHref('/dashboard/hours')}
						/>
					</div>
				</CardHeader>
				<CardContent>
					{selected === 'members' && <UniqueMembersGraph team={team} timeRange={timeRange.current} />}
					{selected === 'hours' && <AverageHoursGraph />}
				</CardContent>
			</div>
		</Card>
	);
}
