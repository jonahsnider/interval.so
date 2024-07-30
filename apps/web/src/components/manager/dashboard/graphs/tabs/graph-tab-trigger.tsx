import 'server-only';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { toDigits } from '@jonahsnider/util';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import { type ReactNode, Suspense } from 'react';
import { searchParamCache, searchParamSerializer } from '../../search-params';

type TabId = 'members' | 'hours';

type Props = {
	active: boolean;
	tabId: TabId;
	team: Pick<TeamSchema, 'slug'>;
	timeFilters: {
		current: TimeFilterSchema;
		previous?: TimeRangeSchema;
	};
};

function TrendBadge({ trend }: { trend: number }) {
	return (
		<Badge
			className={clsx('shadow-none', {
				'hover:bg-primary': trend > 0,
				'hover:bg-destructive': trend < 0,
			})}
			variant={trend > 0 ? 'default' : 'destructive'}
		>
			{trend > 0 && '+'}
			{Math.round(trend * 100)}%
		</Badge>
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

async function Trend({
	tabId,
	team,
	timeFilters,
}: {
	tabId: TabId;
	team: Pick<TeamSchema, 'slug'>;
	timeFilters: {
		current: TimeFilterSchema;
		previous?: TimeRangeSchema;
	};
}) {
	const { trend } = await getMeasure(tabId, team, timeFilters);

	if (trend) {
		return <TrendBadge trend={trend} />;
	}
}

async function Measure({
	tabId,
	team,
	timeFilters,
}: {
	tabId: TabId;
	team: Pick<TeamSchema, 'slug'>;
	timeFilters: {
		current: TimeFilterSchema;
		previous?: TimeRangeSchema;
	};
}) {
	const { current } = await getMeasure(tabId, team, timeFilters);

	return <p className='text-3xl font-semibold'>{toDigits(current, 1)}</p>;
}

const TAB_OPTIONS = {
	members: {
		title: 'Members',
		hrefSuffix: '',
	},
	hours: {
		title: 'Average hours',
		hrefSuffix: '/hours',
	},
};

export function GraphTabTrigger({ tabId, active, timeFilters, team }: Props) {
	// TODO: This hasn't been updated since query states were changed to be shallow - need to refactor to be a client side component probably (seeded with initial server side query states and then updates with client side query states)
	const queryStates = searchParamCache.all();
	const queryString = searchParamSerializer(queryStates);

	const createHref = (subpath: string) => `/team/${team.slug}/dashboard${subpath}${queryString}`;

	return (
		<GraphTabTriggerBase
			active={active}
			href={createHref(TAB_OPTIONS[tabId].hrefSuffix)}
			title={TAB_OPTIONS[tabId].title}
			measure={<Measure tabId={tabId} team={team} timeFilters={timeFilters} />}
			trend={<Trend tabId={tabId} team={team} timeFilters={timeFilters} />}
		/>
	);
}

function GraphTabTriggerBase({
	measure,
	title,
	trend,
	className,
	href,
	active,
}: {
	active: boolean;
	title: string;
	measure: ReactNode;
	trend?: ReactNode;
	className?: string;
	href: string;
}) {
	return (
		<Link
			href={href}
			className={clsx(
				'p-4 border-b-2 border-r flex flex-col gap-2 leading-none items-start',
				{
					'border-b-transparent bg-menu-item': !active,
					'border-b-primary bg-menu-item-selected': active,
				},
				className,
			)}
			scroll={false}
		>
			<p className='font-semibold text-sm text-muted-foreground'>{title}</p>

			<div
				className={clsx('flex gap-4 justify-center items-center', {
					'opacity-80': !active,
				})}
			>
				<div className='text-3xl font-semibold'>
					<Suspense fallback={<Skeleton className='h-9 w-16' />}>{measure}</Suspense>
				</div>

				<Suspense fallback={<Skeleton className='h-5 w-12' />}>{trend}</Suspense>
			</div>
		</Link>
	);
}
