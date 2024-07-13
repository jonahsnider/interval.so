'use client';
import type { RouterOutput } from '@/src/trpc/common';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
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
	const [current, setCurrent] = useState(initialCurrent);
	const [searchParams] = useQueryStates(searchParamParsers);

	const currentTimeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);
	const previousTimeFilter = useMemo(() => toTimeRange(searchParams).previous, [searchParams]);

	trpc.teams.stats.getCombinedHoursSubscription.useSubscription(
		{ team, timeFilter: currentTimeFilter },
		{ onData: setCurrent },
	);

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
	const [trend, setTrend] = useState(initialTrend);

	trpc.teams.stats.getCombinedHoursSubscription.useSubscription(
		{ team, timeFilter: previousTimeFilter },
		{ onData: setTrend },
	);

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
