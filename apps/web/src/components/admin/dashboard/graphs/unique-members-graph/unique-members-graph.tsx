import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { timeRangeToDatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { Suspense } from 'react';
import { UniqueMembersGraphClient } from './unique-members-graph.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeRange: TimeRangeSchema;
};

export function UniqueMembersGraph(props: Props) {
	const dataPromise = trpcServer.teams.stats.getUniqueMembers.query(props);
	const maxMemberCount = trpcServer.teams.members.simpleMemberList.query(props.team).then((members) => members.length);

	const period = timeRangeToDatumPeriod(props.timeRange);

	return (
		<Suspense>
			<UniqueMembersGraphClient
				dataPromise={dataPromise}
				period={period}
				maxMemberCountPromise={maxMemberCount}
				timeRange={props.timeRange}
			/>
		</Suspense>
	);
}
