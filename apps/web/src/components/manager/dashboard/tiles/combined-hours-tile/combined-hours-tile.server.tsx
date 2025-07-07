import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { DurationSlug } from '../../../period-select/duration-slug';
import { CombinedHoursTileClient } from './combined-hours-tile.client';
import { CombinedHoursTileBase } from './combined-hours-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	currentTimeFilter: TimeFilterSchema;
	durationSlug: DurationSlug;
	previousTimeFilter?: TimeRangeSchema;
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
			<Suspense fallback={<CombinedHoursSkeleton previousTimeFilter={props.previousTimeFilter} />}>
				<CombinedHoursTileFetcher {...props} />
			</Suspense>
		</ErrorBoundary>
	);
}

async function CombinedHoursTileFetcher({ team, currentTimeFilter, previousTimeFilter, durationSlug }: Props) {
	const [current, trend] = await Promise.all([
		trpcServer.teams.stats.getCombinedHours.query({ team, timeFilter: currentTimeFilter }),
		previousTimeFilter
			? trpcServer.teams.stats.getCombinedHours.query({ team, timeFilter: previousTimeFilter })
			: undefined,
	]);

	return (
		<CombinedHoursTileClient team={team} durationSlug={durationSlug} initialCurrent={current} initialTrend={trend} />
	);
}

function CombinedHoursSkeleton({ previousTimeFilter }: Pick<Props, 'previousTimeFilter'>) {
	return (
		<CombinedHoursTileBase
			trend={previousTimeFilter && <Skeleton className='h-4 w-40' />}
			value={<Skeleton className='h-10 w-full' />}
		/>
	);
}
