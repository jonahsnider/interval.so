'use client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
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

export function CombinedHoursTileClient({ team, initialCurrent, initialTrend, durationSlug }: Props) {
	const [searchParams] = useQueryStates(searchParamParsers);

	const currentTimeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);
	const previousTimeFilter = useMemo(() => toTimeRange(searchParams).previous, [searchParams]);

	const { data: current = 0 } = useLiveCombinedHours({ team, timeFilter: currentTimeFilter }, initialCurrent);

	return (
		<CombinedHoursTileBase
			value={`${current.toFixed(1)} hours`}
			trend={
				previousTimeFilter && (
					<Trend
						team={team}
						current={current}
						durationSlug={durationSlug}
						initialTrend={initialTrend}
						previousTimeFilter={previousTimeFilter}
					/>
				)
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
