'use client';

import { Card, CardTitle } from '@/components/ui/card';
import { DatumPeriod } from '@hours.frc.sh/api/app/team_stats/schemas/datum_time_range_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import type { UniqueMembersDatumSchema } from '@hours.frc.sh/api/app/team_stats/schemas/unique_members_datum_schema';
import clsx from 'clsx';
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
	dataPromise: Promise<UniqueMembersDatumSchema[]>;
	maxMemberCountPromise: Promise<number>;
	timeRange: TimeRangeSchema;
	period: DatumPeriod;
};

type ChartDatum = {
	timestamp: number;
	memberCount: number;
};

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

function formatTooltipDate(date: Date): string {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		weekday: 'short',
	};

	if (now.getFullYear() !== date.getFullYear()) {
		options.year = 'numeric';
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}

function CustomTooltip({ payload }: TooltipProps<number, string>) {
	const entry = payload?.[0];

	if (!entry) {
		return undefined;
	}

	const data = entry.payload as ChartDatum;

	return (
		<Card className='px-4 py-2 flex flex-col'>
			<div className='flex items-center gap-6 justify-between'>
				<div className='flex gap-2 items-center'>
					<div className='h-3 w-3 rounded-full' style={{ backgroundColor: entry.stroke }} />
					<CardTitle>{entry.name}</CardTitle>
				</div>

				<p className='font-bold bg-muted rounded px-1 py-px'>{data.memberCount.toLocaleString()}</p>
			</div>

			<p className='text-right text-muted-foreground'>{formatTooltipDate(new Date(data.timestamp))}</p>
		</Card>
	);
}

export function UniqueMembersGraphClient({ dataPromise, period, maxMemberCountPromise, timeRange }: Props) {
	const data = use(dataPromise);
	const maxMemberCount = use(maxMemberCountPromise);

	const chartData = useMemo(
		() =>
			data.map(
				(datum): ChartDatum => ({
					timestamp: datum.date.getTime(),
					memberCount: datum.memberCount,
				}),
			),
		[data],
	);

	return (
		<ResponsiveContainer
			width='100%'
			height={384}
			className={clsx(
				'[--chart-accent-1:#888] dark:[--chart-accent-1:#999] [--chart-accent-2:#eaeaea] dark:[--chart-accent-2:#333]',
			)}
		>
			<AreaChart data={chartData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
				<CartesianGrid vertical={false} stroke={'var(--chart-accent-2)'} />
				<XAxis
					dataKey='timestamp'
					domain={[timeRange.start.getTime(), timeRange.end.getTime()]}
					tickFormatter={(date: number) => formatXAxisDate(new Date(date), period)}
					type='number'
					name='Time'
					stroke={'var(--chart-accent-1)'}
					axisLine={false}
					tickLine={false}
					tickMargin={0}
					tickSize={16}
					fontSize={12}
					tickCount={6}
					scale='time'
				/>
				<YAxis
					stroke={'var(--chart-accent-1)'}
					allowDecimals={false}
					domain={[0, maxMemberCount]}
					axisLine={false}
					tickLine={false}
					fontSize={12}
					tickMargin={0}
					tickSize={16}
					strokeWidth={2}
					width={40}
				/>
				{/* Hide tooltip when there's no data, otherwise the cursor will render at x=0 which looks weird */}
				{data.length > 0 && (
					<Tooltip
						content={CustomTooltip}
						cursor={{ strokeWidth: 2, stroke: 'hsl(var(--foreground))' }}
						isAnimationActive={false}
					/>
				)}
				<Area
					type='linear'
					dataKey='memberCount'
					stroke='hsl(var(--primary))'
					name='Members'
					strokeWidth={2}
					fill='hsl(var(--primary))'
					fillOpacity={0.15}
					strokeLinecap='round'
					animationDuration={500}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
