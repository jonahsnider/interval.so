'use client';

import {
	areaChartProps,
	areaProps,
	cartesianGridProps,
	tooltipProps,
	xAxisProps,
	yAxisProps,
} from '@/src/components/graphs/chart-props';
import { CustomTooltip, formatTooltipDate } from '@/src/components/graphs/custom-tooltip';
import type { AverageHoursDatumSchema } from '@hours.frc.sh/api/app/team_stats/schemas/average_hours_datum_schema';
import { DatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import { toDigits } from '@jonahsnider/util';
import { use, useMemo } from 'react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from 'recharts';

type Props = {
	dataPromise: Promise<AverageHoursDatumSchema[]>;
	period: DatumPeriod;
};

type ChartDatum = {
	timestamp: number;
	averageHours: number;
};

// TODO: This is copypasted between each graph, move it to the graph utils file
// biome-ignore lint/style/useNamingConvention: This is camelcase
function formatXAxisDate(date: Date, period: DatumPeriod): string {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
	};

	if (period !== DatumPeriod.Monthly) {
		options.day = 'numeric';
	}

	if (date.getFullYear() !== now.getFullYear()) {
		options.year = 'numeric';
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}

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

export function AverageHoursGraphClient({ dataPromise, period }: Props) {
	const data = use(dataPromise);

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
		<ResponsiveContainer width='100%' height={384}>
			<AreaChart {...areaChartProps()} data={chartData}>
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
					<Tooltip
						{...tooltipProps()}
						content={(props: TooltipProps<number, string>) => <HoursTooltip tooltipProps={props} period={period} />}
					/>
				)}
				<Area {...areaProps({ color: 'primary' })} dataKey='averageHours' name='Average hours' />
			</AreaChart>
		</ResponsiveContainer>
	);
}
