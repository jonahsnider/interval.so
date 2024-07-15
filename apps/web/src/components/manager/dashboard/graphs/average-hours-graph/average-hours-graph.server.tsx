import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { timeFilterToDatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeFilterSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import { AverageHoursGraphClient } from './average-hours-graph.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeFilter: TimeFilterSchema;
};

export function AverageHoursGraph(props: Props) {
	const dataPromise = trpcServer.teams.stats.averageHours.getTimeSeries.query(props);

	const period = timeFilterToDatumPeriod(props.timeFilter);

	return (
		<Suspense fallback={<div className='h-96' />}>
			<AverageHoursGraphClient dataPromise={dataPromise} period={period} team={props.team} />
		</Suspense>
	);
}
