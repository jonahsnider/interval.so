'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/src/components/data-tables/table-pagination';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import {
	type PaginationState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useQueryStates } from 'nuqs';
import { use, useMemo, useState } from 'react';
import { toTimeFilter } from '../../period-select/duration-slug';
import { searchParamParsers } from '../search-params';
import { columns } from './columns';
import { InnerTableContainer, OuterTableContainer } from './meetings-table-common';
import { MeetingsTableFilters } from './meetings-table-filters';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialDataPromise: Promise<TeamMeetingSchema[]>;
};

export function MeetingsTableClient({ initialDataPromise, team }: Props) {
	const initialData = use(initialDataPromise);
	const [data, setData] = useState(initialData);

	const [searchParams] = useQueryStates(searchParamParsers);
	const timeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);

	trpc.teams.meetings.meetingsSubscription.useSubscription({ team, timeFilter }, { onData: setData });

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
		data,
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
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
		</OuterTableContainer>
	);
}
