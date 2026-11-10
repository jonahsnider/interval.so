import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { toDigits } from '@jonahsnider/util';
import { TabsTrigger } from '@radix-ui/react-tabs';
import { Suspense } from 'react';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { trpcServer } from '@/src/trpc/trpc-server';

type TabId = 'members' | 'hours';

type Props = {
	tabId: TabId;
	team: Pick<TeamSchema, 'slug'>;
	timeFilters: {
		current: TimeFilterSchema;
		previous?: TimeRangeSchema;
	};
};

function TrendBadge({ trend }: { trend: number }) {
	return (
		<span
			className={cn(badgeVariants({ variant: trend > 0 ? 'default' : 'destructive' }), 'shadow-none', {
				'hover:bg-primary': trend > 0,
				'hover:bg-destructive': trend < 0,
			})}
		>
			{trend > 0 && '+'}
			{Math.round(trend * 100)}%
		</span>
	);
}

async function getMeasure(
	tabId: TabId,
	team: Pick<TeamSchema, 'slug'>,
	timeFilters: {
		current: TimeFilterSchema;
		previous?: TimeRangeSchema;
	},
): Promise<{
	current: number;
	trend?: number;
}> {
	// TODO: Find a way to make this realtime, probably less DRY since it's more trend specific

	switch (tabId) {
		case 'members': {
			const [current, previous] = await Promise.all([
				trpcServer.teams.stats.uniqueMembers.getSimple.query({ team, timeFilter: timeFilters.current }),
				timeFilters.previous
					? trpcServer.teams.stats.uniqueMembers.getSimple.query({ team, timeFilter: timeFilters.previous })
					: undefined,
			]);

			return {
				current,
				trend: previous ? current / previous - 1 : undefined,
			};
		}
		case 'hours': {
			const [current, previous] = await Promise.all([
				trpcServer.teams.stats.averageHours.getSimple.query({ team, timeFilter: timeFilters.current }),
				timeFilters.previous
					? trpcServer.teams.stats.averageHours.getSimple.query({ team, timeFilter: timeFilters.previous })
					: undefined,
			]);

			return {
				current,
				trend: previous ? current / previous - 1 : undefined,
			};
		}
	}
}

async function Trend({ measurePromise }: { measurePromise: ReturnType<typeof getMeasure> }) {
	const { trend } = await measurePromise;

	if (trend) {
		return <TrendBadge trend={trend} />;
	}
}

async function Measure({ measurePromise }: { measurePromise: ReturnType<typeof getMeasure> }) {
	const { current } = await measurePromise;

	return <span className='text-3xl font-semibold'>{toDigits(current, 1)}</span>;
}

const TAB_TITLES = {
	members: 'Members',
	hours: 'Average hours',
};

export function GraphTabTrigger({ tabId, timeFilters, team }: Props) {
	const measurePromise = getMeasure(tabId, team, timeFilters);

	return (
		<TabsTrigger
			value={tabId}
			aria-label={TAB_TITLES[tabId]}
			className='group p-4 border-b-2 border-r flex flex-col gap-2 leading-none items-start border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-card'
		>
			<span className='font-semibold text-sm text-muted-foreground'>{TAB_TITLES[tabId]}</span>

			<span className='flex gap-4 justify-center items-center group-data-[state=inactive]:opacity-80'>
				<Suspense fallback={<span className='h-9 w-16 animate-pulse rounded-md bg-secondary' />}>
					<Measure measurePromise={measurePromise} />
				</Suspense>
				<Suspense fallback={<span className='h-5 w-12 animate-pulse rounded-md bg-secondary' />}>
					<Trend measurePromise={measurePromise} />
				</Suspense>
			</span>
		</TabsTrigger>
	);
}
