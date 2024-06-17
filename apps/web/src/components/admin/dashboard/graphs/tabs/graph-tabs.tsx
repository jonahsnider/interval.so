import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { AverageHoursGraph } from '../average-hours-graph';
import { UniqueMembersGraph } from '../unique-members-graph';
import { GraphTabTrigger } from './graph-tab-trigger';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	selected: 'members' | 'hours';
};

export function GraphTabs({ team, selected }: Props) {
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
							href={`/team/${team.slug}/admin`}
						/>

						<GraphTabTrigger
							active={selected === 'hours'}
							title='Average hours'
							measure={5.7}
							trend={-0.13}
							href={`/team/${team.slug}/admin/dashboard/hours`}
						/>
					</div>
				</CardHeader>

				<CardContent>
					{selected === 'members' && <UniqueMembersGraph />}
					{selected === 'hours' && <AverageHoursGraph />}
				</CardContent>
			</div>
		</Card>
	);
}
