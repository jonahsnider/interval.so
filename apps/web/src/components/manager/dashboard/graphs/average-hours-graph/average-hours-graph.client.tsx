'use client';

import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
	areaChartProps,
	areaProps,
	cartesianGridProps,
	tooltipProps,
	xAxisProps,
	yAxisProps,
} from '@/src/components/graphs/chart-props';
import { CustomTooltip, formatTooltipDate } from '@/src/components/graphs/custom-tooltip';
import { formatXAxisDate } from '@/src/components/graphs/graph-utils';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { AverageHoursDatumSchema } from '@hours.frc.sh/api/app/team_stats/schemas/average_hours_datum_schema';
import type { DatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeFilterSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_filter_schema';
import { toDigits } from '@jonahsnider/util';
import { use, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, type TooltipProps, XAxis, YAxis } from 'recharts';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeFilter: TimeFilterSchema;
	dataPromise: Promise<AverageHoursDatumSchema[]>;
	period: DatumPeriod;
};

type ChartDatum = {
	timestamp: number;
	averageHours: number;
};

const chartConfig = {
	averageHours: {
		label: 'Average hours',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig;

function HoursTooltip({
	period,
	tooltipProps,
}: {
	tooltipProps: TooltipProps<number, string>;
	period: DatumPeriod;
}) {
	const entry = tooltipProps.payload?.[0];

	if (!entry) {
		return undefined;
	}

	const data = entry.payload as ChartDatum;

	return (
		<CustomTooltip
			color={entry.stroke}
			title={entry.name}
			value={data.averageHours.toLocaleString()}
			footer={formatTooltipDate(new Date(data.timestamp), period)}
		/>
	);
}

export function AverageHoursGraphClient({ dataPromise, period, team, timeFilter }: Props) {
	const initialData = use(dataPromise);
	const [data, setData] = useState(initialData);

	trpc.teams.stats.averageHours.subscribeTimeSeries.useSubscription({ team, timeFilter }, { onData: setData });

	const chartData = useMemo(
		() =>
			data.map(
				(datum): ChartDatum => ({
					timestamp: datum.date.getTime(),
					averageHours: toDigits(datum.averageHours, 1),
				}),
			),
		[data],
	);

	return (
		<ChartContainer config={chartConfig} className='h-96 w-full'>
			<AreaChart {...areaChartProps()} accessibilityLayer={true} data={chartData}>
				<CartesianGrid {...cartesianGridProps()} />
				<XAxis
					{...xAxisProps()}
					dataKey='timestamp'
					domain={['auto', 'auto']}
					tickFormatter={(date: number) => formatXAxisDate(new Date(date), period)}
					type='number'
					name='Time'
					scale='time'
				/>
				<YAxis {...yAxisProps()} domain={[0, 'auto']} width={40} />
				{/* Hide tooltip when there's no data, otherwise the cursor will render at x=0 which looks weird */}
				{data.length > 0 && (
					<ChartTooltip
						{...tooltipProps()}
						content={(props: TooltipProps<number, string>) => <HoursTooltip tooltipProps={props} period={period} />}
					/>
				)}
				<Area
					{...areaProps()}
					dataKey='averageHours'
					name='Average hours'
					fill='var(--color-averageHours)'
					stroke='var(--color-averageHours)'
				/>
			</AreaChart>
		</ChartContainer>
	);
}
