'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import {
	type ColumnFiltersState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';
import { columns } from './columns';
import { MembersTableButtons } from './members-table-buttons';
import { InnerTableContainer, OuterTableContainer } from './members-table-common';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialData: TeamMemberSchema[];
	loading: boolean;
};

function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell>
				<div className='flex justify-center items-center'>
					<Skeleton className='w-4 h-4' />
				</div>
			</TableCell>
			<TableCell className='w-full'>
				<Skeleton className='w-80 h-4' />
			</TableCell>
			<TableCell>
				<Skeleton className='h-4' />
			</TableCell>
			<TableCell>
				<Skeleton className='h-4' />
			</TableCell>
			<TableCell>
				<div className='flex justify-end items-center'>
					<Skeleton className='w-8 h-8' />
				</div>
			</TableCell>
		</TableRow>
	);
}

export function MembersTableClient({ initialData, loading, team }: Props) {
	const [data, setData] = useState(initialData);

	trpc.teams.members.fullMemberListSubscription.useSubscription(team, { onData: setData });

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'name',
			desc: true,
		},
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'archived', value: [false] }]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<OuterTableContainer>
			<MembersTableButtons table={table} loading={loading} />

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
						{loading && (
							<>
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
							</>
						)}
						{!loading &&
							(table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className={clsx({
													'w-full': cell.column.columnDef.id === 'name',
												})}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className='h-24 text-center'>
										No results.
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</InnerTableContainer>
		</OuterTableContainer>
	);
}
