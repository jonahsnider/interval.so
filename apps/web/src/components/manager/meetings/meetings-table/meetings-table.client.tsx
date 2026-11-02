'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { use, useState } from 'react';
import { Skeleton } from 'skullet/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/src/components/data-tables/table-pagination';
import { useLiveMeetings } from '@/src/trpc/live-queries';
import { useMeetingsTimeFilter } from '../meetings-time-filter-provider';
import { columns } from './columns';
import { InnerTableContainer, OuterTableContainer } from './meetings-table-common';
import { MeetingsTableFilters } from './meetings-table-filters';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialDataPromise: Promise<TeamMeetingSchema[]>;
};

const sampleMeetings: TeamMeetingSchema[] = Array.from({ length: 10 }, (_, index) => ({
	startedAt: new Date(Date.UTC(2026, 0, 15 - index, 17)),
	endedAt: new Date(Date.UTC(2026, 0, 15 - index, 19)),
	attendeeCount: 24,
	attendees: [],
}));

export function MeetingsTableLoading() {
	return <MeetingsTableContent />;
}

export function MeetingsTableClient({ initialDataPromise, team }: Props) {
	const initialData = use(initialDataPromise);

	const timeFilter = useMeetingsTimeFilter();

	const { data } = useLiveMeetings({ team, timeFilter }, initialData);
	return <MeetingsTableContent data={data} />;
}

function MeetingsTableContent({ data }: { data?: TeamMeetingSchema[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'endedAt',
			desc: true,
		},
	]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data: data ?? sampleMeetings,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		getRowId: (meeting) => meeting.startedAt.getTime().toString() + meeting.endedAt?.getTime().toString(),
		state: {
			sorting,
			pagination,
		},
	});

	return (
		<OuterTableContainer>
			<MeetingsTableFilters />
			<Skeleton
				data={data ?? sampleMeetings}
				sample={sampleMeetings}
				loading={data === undefined}
				label='Loading meetings'
			>
				{() => (
					<div className='flex flex-col gap-4'>
						<InnerTableContainer>
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												return (
													<TableHead
														key={header.id}
														className={clsx({
															'w-full': header.id === 'title',
														})}
													>
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length > 0 ? (
										table.getRowModel().rows.map((row) => (
											<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={columns.length} className='h-24 text-center'>
												No results
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</InnerTableContainer>

						<div className='flex items-center justify-end'>
							<TablePagination table={table} />
						</div>
					</div>
				)}
			</Skeleton>
		</OuterTableContainer>
	);
}
