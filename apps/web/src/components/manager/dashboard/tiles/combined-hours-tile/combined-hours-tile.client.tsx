'use client';
import type { RouterOutput } from '@/src/trpc/common';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { type ReactNode, useState } from 'react';
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
	// const [current] = trpc.teams.stats.getCombinedHours.useSuspenseQuery(
	// 	{ team, timeRange: currentTimeRange },
	// 	{ initialData: initialCurrent },
	// );
	const [current, setCurrent] = useState(initialCurrent);

	trpc.teams.stats.getCombinedHoursSubscription.useSubscription(
		{ team, timeRange: currentTimeRange },
		{ onData: setCurrent },
	);

	// Evil conditional hook but it's okay since this component gets unmounted if the trend time range changes
	const [trend] =
		previousTimeRange && initialTrend
			? trpc.teams.stats.getCombinedHours.useSuspenseQuery(
					{ team, timeRange: previousTimeRange },
					{ initialData: initialTrend },
				)
			: [undefined];

	const currentFormatted = `${current.toFixed(1)} hours`;

	let trendFormatted: ReactNode;

	if (current !== 0 && trend) {
		const percentChange = Math.round((trend / current - 1) * 100);

		if (Number.isNaN(percentChange)) {
			throw new RangeError('percentChange is NaN');
		}

		trendFormatted = (
			<>
				{percentChange >= 0 && '+'}
				{percentChange}% from {durationLabelPreviousPeriod(durationSlug)?.toLowerCase()}
			</>
		);
	}

	return <CombinedHoursTileBase value={currentFormatted} trend={trendFormatted} />;
}
