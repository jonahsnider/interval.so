'use client';
import type { RouterOutput } from '@/src/trpc/common';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { useState } from 'react';
import { type DurationSlug, durationLabelPreviousPeriod } from '../../../period-select/duration-slug';
import { CombinedHoursTileBase } from './combined-hours-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;

	durationSlug: DurationSlug;

	initialCurrent: RouterOutput['teams']['stats']['getCombinedHours'];
	currentTimeRange: TimeRangeSchema;

	initialTrend?: RouterOutput['teams']['stats']['getCombinedHours'];
	previousTimeRange?: TimeRangeSchema;
};

export function CombinedHoursTileClient({
	team,
	currentTimeRange,
	previousTimeRange,
	initialCurrent,
	initialTrend,
	durationSlug,
}: Props) {
	const [current, setCurrent] = useState(initialCurrent);

	trpc.teams.stats.getCombinedHoursSubscription.useSubscription(
		{ team, timeRange: currentTimeRange },
		{ onData: setCurrent },
	);

	return (
		<CombinedHoursTileBase
			value={`${current.toFixed(1)} hours`}
			trend={
				previousTimeRange && (
					<Trend
						team={team}
						current={current}
						durationSlug={durationSlug}
						initialTrend={initialTrend}
						previousTimeRange={previousTimeRange}
					/>
				)
			}
		/>
	);
}

function Trend({
	initialTrend,
	durationSlug,
	previousTimeRange,
	team,
	current,
}: {
	team: Pick<TeamSchema, 'slug'>;
	current: number;
	durationSlug: DurationSlug;
	initialTrend?: RouterOutput['teams']['stats']['getCombinedHours'];
	previousTimeRange: TimeRangeSchema;
}) {
	const [trend, setTrend] = useState(initialTrend);

	trpc.teams.stats.getCombinedHoursSubscription.useSubscription(
		{ team, timeRange: previousTimeRange },
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
