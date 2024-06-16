import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { parseAsStringEnum } from 'nuqs';
import { AverageHoursGraph } from '../average-hours-graph';
import { UniqueMembersGraph } from '../unique-members-graph';
import { GraphTabTrigger } from './graph-tab-trigger';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	searchParams: { [key: string]: string | string[] | undefined };
};

const graphTabParser = parseAsStringEnum(['members', 'hours'])
	.withDefault('members')
	.withOptions({ clearOnDefault: true });

export function GraphTabs({ team, searchParams }: Props) {
	// This component was originally using the Radix UI Tabs component, which is client side
	// I refactored it to be purely server components, only the graphs themselves are client components
	// If switching from one tab to another feels icky (ex. load time for the server component), I can revert it to be client side & more responsive
	const selected = graphTabParser.parseServerSide(searchParams.graph);

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
							href={`/team/${team.slug}/admin?graph=hours`}
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
