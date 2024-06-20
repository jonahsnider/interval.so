import 'server-only';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { Suspense } from 'react';
import { InnerTableContainer, OuterTableContainer } from './meetings-table-common';
import { MeetingsTableClient } from './meetings-table.client';

export function MeetingsTable({
	team,
	timeRange,
}: {
	team: Pick<TeamSchema, 'slug'>;
	timeRange: TimeRangeSchema;
}) {
	const dataPromise = trpcServer.teams.meetings.getMeetings.query({ team, timeRange });

	return (
		<Suspense fallback={<MeetingsTableSkeleton />}>
			<MeetingsTableClient dataPromise={dataPromise} />
		</Suspense>
	);
}

function MeetingsTableSkeleton() {
	return (
		<OuterTableContainer>
			{/* Filter button */}
			<Skeleton className='w-40 h-9' />

			<InnerTableContainer>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-96'>
								<Skeleton className='w-full h-4' />
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
			<TableCell>
				<Skeleton className='w-full h-4' />
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
