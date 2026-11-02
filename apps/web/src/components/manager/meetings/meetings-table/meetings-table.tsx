import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { trpcServer } from '@/src/trpc/trpc-server';
import { MeetingsTableClient, MeetingsTableLoading } from './meetings-table.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	timeFilter: TimeFilterSchema;
};

export function MeetingsTable({ team, timeFilter }: Props) {
	const dataPromise = trpcServer.teams.meetings.getMeetings.query({ team, timeFilter: timeFilter });

	return (
		<ErrorBoundary
			fallback={
				<div className='flex items-center justify-center h-96 rounded-md border bg-card'>
					<p className='text-muted-foreground'>An error occurred while rendering this table</p>
				</div>
			}
		>
			<Suspense fallback={<MeetingsTableLoading />}>
				<MeetingsTableClient initialDataPromise={dataPromise} team={team} />
			</Suspense>
		</ErrorBoundary>
	);
}
