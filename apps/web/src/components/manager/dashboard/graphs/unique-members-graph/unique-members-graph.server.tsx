import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { timeFilterToDatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeFilterSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import { UniqueMembersGraphClient } from './unique-members-graph.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeFilter: TimeFilterSchema;
};

export function UniqueMembersGraph(props: Props) {
	const dataPromise = trpcServer.teams.stats.uniqueMembers.getTimeSeries.query(props);
	const maxMemberCount = trpcServer.teams.members.simpleMemberList.query(props.team).then((members) => members.length);

	const period = timeFilterToDatumPeriod(props.timeFilter);

	return (
		<Suspense fallback={<div className='h-96' />}>
			<UniqueMembersGraphClient
				dataPromise={dataPromise}
				period={period}
				maxMemberCountPromise={maxMemberCount}
				team={props.team}
			/>
		</Suspense>
	);
}
