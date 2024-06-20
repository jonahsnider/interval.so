'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useState } from 'react';
import { searchParamParsers } from '../dashboard/search-params';
import { type GlobalFilterValue, globalFilterFn } from './columns';
import { MeetingsTableFilters } from './meetings-table-filters';

interface Props {
	columns: ColumnDef<TeamMeetingSchema>[];
	data: TeamMeetingSchema[];
}

export function MeetingsTable({ columns, data }: Props) {
	const [queryStates] = useQueryStates(searchParamParsers);

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'end',
			desc: true,
		},
	]);

	const [globalFilter, setGlobalFilter] = useState<GlobalFilterValue>(queryStates);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getColumnCanGlobalFilter(column) {
			return column.id === 'end' || column.id === 'start';
		},
		globalFilterFn,
		state: {
			sorting,
			globalFilter,
		},
	});

	return (
		<div className='flex flex-col gap-4'>
			<MeetingsTableFilters table={table} />

			<div className='rounded-md border bg-background whitespace-nowrap'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
