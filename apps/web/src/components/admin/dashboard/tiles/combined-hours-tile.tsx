import assert from 'node:assert/strict';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import clsx from 'clsx';
import { type ReactNode, Suspense } from 'react';
import { type DurationSlug, durationLabelPreviousPeriod } from '../../period-select/duration-slug';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	currentTimeRange: TimeRangeSchema;
	durationSlug: DurationSlug;
	previousTimeRange?: TimeRangeSchema;
};

export function CombinedHoursTile(props: Props) {
	return (
		<Suspense fallback={<CombinedHoursSkeleton previousTimeRange={props.previousTimeRange} />}>
			<CombinedHoursTileFetcher {...props} />
		</Suspense>
	);
}

async function CombinedHoursTileFetcher({ team, currentTimeRange, previousTimeRange, durationSlug }: Props) {
	const [current, trend] = await Promise.all([
		trpcServer.teams.stats.getCombinedHours.query({ team, timeRange: currentTimeRange }),
		previousTimeRange
			? trpcServer.teams.stats.getCombinedHours.query({ team, timeRange: previousTimeRange })
			: undefined,
	]);

	const currentFormatted = current.toFixed(1);

	if (current !== 0 && trend) {
		const percentChange = Math.round((trend / current - 1) * 100);

		assert(!Number.isNaN(percentChange));

		return (
			<CombinedHoursTileBase
				trend={
					<>
						{percentChange >= 0 && '+'}
						{percentChange}% from {durationLabelPreviousPeriod(durationSlug)?.toLowerCase()}
					</>
				}
				value={currentFormatted}
			/>
		);
	}

	return <CombinedHoursTileBase value={currentFormatted} />;
}

function CombinedHoursSkeleton({ previousTimeRange }: Pick<Props, 'previousTimeRange'>) {
	return (
		<CombinedHoursTileBase
			trend={previousTimeRange && <Skeleton className='h-4 w-40' />}
			value={<Skeleton className='h-10 w-full' />}
		/>
	);
}

function CombinedHoursTileBase({ trend, value }: { trend?: ReactNode; value: ReactNode }) {
	return (
		<Card>
			<CardHeader className='pb-2'>
				<CardDescription className='text-base'>Combined hours</CardDescription>
				<CardTitle className='text-4xl'>{value}</CardTitle>
			</CardHeader>
			<CardFooter
				className={clsx('text-xs text-muted-foreground', {
					invisible: !trend,
				})}
			>
				{trend}
			</CardFooter>
		</Card>
	);
}
