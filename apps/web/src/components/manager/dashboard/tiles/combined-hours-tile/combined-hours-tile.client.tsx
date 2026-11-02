'use client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { useQueryStates } from 'nuqs';
import { type ReactNode, useMemo } from 'react';
import { Skeleton } from 'skullet/react';
import type { RouterOutput } from '@/src/trpc/common';
import { useLiveCombinedHours } from '@/src/trpc/live-queries';
import {
	type DurationSlug,
	durationLabelPreviousPeriod,
	toTimeFilter,
	toTimeRange,
} from '../../../period-select/duration-slug';
import { searchParamParsers } from '../../search-params';
import { CombinedHoursTileBase } from './combined-hours-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;

	durationSlug: DurationSlug;

	initialCurrent: RouterOutput['teams']['stats']['getCombinedHours'];

	initialTrend?: RouterOutput['teams']['stats']['getCombinedHours'];
};

type TileData = { current: number; trend?: ReactNode };
const sampleData: TileData = { current: 128, trend: '+12% from last period' };

export function CombinedHoursTileLoading() {
	return <CombinedHoursTileContent data={sampleData} loading />;
}

function CombinedHoursTileContent({ data, loading = false }: { data: TileData; loading?: boolean }) {
	return (
		<Skeleton data={data} sample={sampleData} loading={loading} label='Loading combined hours'>
			{({ current, trend }) => <CombinedHoursTileBase value={`${current.toFixed(1)} hours`} trend={trend} />}
		</Skeleton>
	);
}

export function CombinedHoursTileClient({ team, initialCurrent, initialTrend, durationSlug }: Props) {
	const [searchParams] = useQueryStates(searchParamParsers);

	const currentTimeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);
	const previousTimeFilter = useMemo(() => toTimeRange(searchParams).previous, [searchParams]);

	const { data: current } = useLiveCombinedHours({ team, timeFilter: currentTimeFilter }, initialCurrent);

	return (
		<CombinedHoursTileContent
			loading={current === undefined}
			data={
				current === undefined
					? sampleData
					: {
							current,
							trend: previousTimeFilter ? (
								<Trend
									team={team}
									current={current}
									durationSlug={durationSlug}
									initialTrend={initialTrend}
									previousTimeFilter={previousTimeFilter}
								/>
							) : undefined,
						}
			}
		/>
	);
}

function Trend({
	initialTrend,
	durationSlug,
	previousTimeFilter,
	team,
	current,
}: {
	team: Pick<TeamSchema, 'slug'>;
	current: number;
	durationSlug: DurationSlug;
	initialTrend?: RouterOutput['teams']['stats']['getCombinedHours'];
	previousTimeFilter: TimeRangeSchema;
}) {
	const { data: trend } = useLiveCombinedHours({ team, timeFilter: previousTimeFilter }, initialTrend);

	if (current !== 0 && trend) {
		const percentChange = Math.round((trend / current - 1) * 100);

		if (Number.isNaN(percentChange)) {
			throw new RangeError('percentChange is NaN');
		}

		return (
			<>
				{percentChange >= 0 && '+'}
				{percentChange}% from {durationLabelPreviousPeriod(durationSlug)?.toLowerCase()}
			</>
		);
	}
}
