import 'server-only';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeFilterSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { InnerTableContainer, OuterTableContainer } from './meetings-table-common';
import { MeetingsTableClient } from './meetings-table.client';

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
			<Suspense fallback={<MeetingsTableSkeleton />}>
				<MeetingsTableClient initialDataPromise={dataPromise} team={team} />
			</Suspense>
		</ErrorBoundary>
	);
}

function MeetingsTableSkeleton() {
	return (
		<OuterTableContainer>
			<div className='flex items-center justify-end'>
				{/* Filter button */}
				<Skeleton className='w-40 h-9' />
			</div>

			<InnerTableContainer>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								<Skeleton className='w-32 h-4' />
							</TableHead>
							<TableHead>
								<Skeleton className='w-full h-4' />
							</TableHead>
							<TableHead className='w-52'>
								<Skeleton className='w-full h-4' />
							</TableHead>
							<TableHead className='w-48'>
								<Skeleton className='w-full h-4' />
							</TableHead>
							<TableHead className='w-36'>
								<Skeleton className='w-full h-4' />
							</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>

					<TableBody>
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
						<TableRowSkeleton />
					</TableBody>
				</Table>
			</InnerTableContainer>
		</OuterTableContainer>
	);
}

function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell className='w-96'>
				<Skeleton className='w-64 h-4' />
			</TableCell>
			<TableCell>
				<div className='flex justify-end items-center'>
					<Skeleton className='w-8 h-4' />
				</div>
			</TableCell>
			<TableCell>
				<Skeleton className='w-full h-4' />
			</TableCell>
			<TableCell>
				<Skeleton className='w-full h-4' />
			</TableCell>
			<TableCell>
				<Skeleton className='w-full h-4' />
			</TableCell>
			<TableCell>
				<div className='flex justify-end items-center'>
					<Skeleton className='w-8 h-8' />
				</div>
			</TableCell>
		</TableRow>
	);
}
