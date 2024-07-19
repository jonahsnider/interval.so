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
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { DatumPeriod } from '@interval.so/api/app/team_stats/schemas/datum_time_range_schema';
import type { UniqueMembersDatumSchema } from '@interval.so/api/app/team_stats/schemas/unique_members_datum_schema';
import { max } from '@jonahsnider/util';
import { useQueryStates } from 'nuqs';
import { use, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, type TooltipProps, XAxis, YAxis } from 'recharts';
import { toTimeFilter } from '../../../period-select/duration-slug';
import { searchParamParsers } from '../../search-params';

type Props = {
	dataPromise: Promise<UniqueMembersDatumSchema[]>;
	maxMemberCountPromise: Promise<number>;
	period: DatumPeriod;
	team: Pick<TeamSchema, 'slug'>;
};

type ChartDatum = {
	timestamp: number;
	memberCount: number;
};

const chartConfig = {
	memberCount: {
		label: 'Members',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig;

function MembersTooltip({
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
			value={data.memberCount.toLocaleString()}
			footer={formatTooltipDate(new Date(data.timestamp), period)}
		/>
	);
}

export function UniqueMembersGraphClient({ dataPromise, period, maxMemberCountPromise, team }: Props) {
	const initialData = use(dataPromise);
	const [data, setData] = useState(initialData);
	const [searchParams] = useQueryStates(searchParamParsers);
	const timeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);

	trpc.teams.stats.uniqueMembers.subscribeTimeSeries.useSubscription({ team, timeFilter }, { onData: setData });

	const maxMemberCountHint = use(maxMemberCountPromise);
	const maxMemberCount = Math.max(
		maxMemberCountHint,
		data.map((x) => x.memberCount).reduce(max, 0),
		// Prevents the graph from being totally empty on the y-axis (looks weird)
		4,
	);

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
				<YAxis {...yAxisProps()} domain={[0, maxMemberCount]} width={40} />
				{/* Hide tooltip when there's no data, otherwise the cursor will render at x=0 which looks weird */}
				{data.length > 0 && (
					<ChartTooltip
						{...tooltipProps()}
						content={(props: TooltipProps<number, string>) => <MembersTooltip tooltipProps={props} period={period} />}
					/>
				)}
				<Area
					{...areaProps()}
					dataKey='memberCount'
					name='Members'
					fill='var(--color-memberCount)'
					stroke='var(--color-memberCount)'
				/>
			</AreaChart>
		</ChartContainer>
	);
}
