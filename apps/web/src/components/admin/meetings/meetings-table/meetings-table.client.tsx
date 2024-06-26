'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type SortingState,
} from '@tanstack/react-table';
import { use, useEffect, useState } from 'react';
import { columns } from './columns';
import { InnerTableContainer, OuterTableContainer } from './meetings-table-common';
import { MeetingsTableFilters } from './meetings-table-filters';

type Props = {
	dataPromise: Promise<TeamMeetingSchema[]>;
};

export function MeetingsTableClient({ dataPromise }: Props) {
	const data = use(dataPromise);

	useEffect(() => {
		console.table(data);
	}, [data]);

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'end',
			desc: true,
		},
	]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
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
			</InnerTableContainer>
		</OuterTableContainer>
	);
}
