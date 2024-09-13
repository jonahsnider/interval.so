'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/src/components/data-tables/table-pagination';
import { TableSelectionStatus } from '@/src/components/data-tables/table-selection-status';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import {
	type ColumnFiltersState,
	type PaginationState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';
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

	const [fuse] = useState(new Fuse(data, { keys: ['name'] }));

	useEffect(() => {
		fuse.setCollection(data);
	}, [data, fuse]);

	trpc.teams.members.fullMemberListSubscription.useSubscription(team, { onData: setData });

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'name',
			desc: false,
		},
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'archived', value: [false] }]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 50,
	});

	const [globalFilter, setGlobalFilter] = useState('');

	const [filteredRowIds, setFilteredRowIds] = useState<Set<string>>(new Set());

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		getRowId: (member) => member.id,
		enableGlobalFilter: true,
		onGlobalFilterChange: (newFilter) => {
			setFilteredRowIds(new Set(fuse.search(newFilter).map((result) => result.item.id)));
			setGlobalFilter(newFilter);
		},
		globalFilterFn: (row) => filteredRowIds.has(row.original.id),
		initialState: {
			columnVisibility: {
				// Used only for filtering
				signedInAt: false,
			},
		},
		state: {
			sorting,
			columnFilters,
			pagination,
			globalFilter,
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
										<TableHead
											key={header.id}
											className={clsx({
												'w-full': header.id === 'name',
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
							(table.getRowModel().rows?.length > 0 ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									{/* All columns except for the hidden "signedInAt" column */}
									<TableCell colSpan={columns.length - 1} className='h-24 text-center'>
										No results
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</InnerTableContainer>

			<div className='flex items-center justify-between'>
				<TableSelectionStatus table={table} />
				<TablePagination table={table} />
			</div>
		</OuterTableContainer>
	);
}
