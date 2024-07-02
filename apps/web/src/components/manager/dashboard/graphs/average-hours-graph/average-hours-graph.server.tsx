import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { timeRangeToDatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { Suspense } from 'react';
import { AverageHoursGraphClient } from './average-hours-graph.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeRange: TimeRangeSchema;
};

export function AverageHoursGraph(props: Props) {
	const dataPromise = trpcServer.teams.stats.averageHours.getTimeSeries.query(props);

	const period = timeRangeToDatumPeriod(props.timeRange);

	return (
		<Suspense fallback={<div className='h-96' />}>
			<AverageHoursGraphClient dataPromise={dataPromise} period={period} />
		</Suspense>
	);
}
