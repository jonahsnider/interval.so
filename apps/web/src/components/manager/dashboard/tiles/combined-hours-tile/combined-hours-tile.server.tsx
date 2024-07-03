import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { DurationSlug } from '../../../period-select/duration-slug';
import { CombinedHoursTileClient } from './combined-hours-tile.client';
import { CombinedHoursTileBase } from './combined-hours-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	currentTimeRange: TimeRangeSchema;
	durationSlug: DurationSlug;
	previousTimeRange?: TimeRangeSchema;
};

export function CombinedHoursTile(props: Props) {
	return (
		<ErrorBoundary
			fallback={
				<CombinedHoursTileBase
					value={<p className='text-base font-normal tracking-normal'>An error occurred while rendering this tile</p>}
				/>
			}
		>
			<Suspense fallback={<CombinedHoursSkeleton previousTimeRange={props.previousTimeRange} />}>
				<CombinedHoursTileFetcher {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

async function CombinedHoursTileFetcher({ team, currentTimeRange, previousTimeRange, durationSlug }: Props) {
	const [current, trend] = await Promise.all([
		trpcServer.teams.stats.getCombinedHours.query({ team, timeRange: currentTimeRange }),
		previousTimeRange
			? trpcServer.teams.stats.getCombinedHours.query({ team, timeRange: previousTimeRange })
			: undefined,
	]);

	return (
		<CombinedHoursTileClient
			team={team}
			currentTimeRange={currentTimeRange}
			durationSlug={durationSlug}
			previousTimeRange={previousTimeRange}
			initialCurrent={current}
			initialTrend={trend}
		/>
	);
}

function CombinedHoursSkeleton({ previousTimeRange }: Pick<Props, 'previousTimeRange'>) {
	return (
		<CombinedHoursTileBase
			trend={previousTimeRange && <Skeleton className='h-4 w-40' />}
			value={<Skeleton className='h-10 w-full' />}
		/>
	);
}
