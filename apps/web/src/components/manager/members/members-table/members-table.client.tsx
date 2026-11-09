'use client';

import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import {
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';
import { Skeleton } from 'skullet/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/src/components/data-tables/table-pagination';
import { TableSelectionStatus } from '@/src/components/data-tables/table-selection-status';
import { type FullMembersHandle, useLiveFullMembers } from '@/src/trpc/live-queries';
import { columns } from './columns';
import { MembersTableButtons } from './members-table-buttons';
import { InnerTableContainer, OuterTableContainer } from './members-table-common';

type Props = {
	membersHandle: FullMembersHandle;
};

const sampleMembers: TeamMemberSchema[] = Array.from({ length: 10 }, (_, index) => ({
	id: `sample-member-${index}`,
	name: 'Alex Morgan',
	archived: false,
	lastSeenAt: new Date('2026-01-15T17:00:00Z'),
}));

export function MembersTableLoading() {
	return <MembersTableContent />;
}

export function MembersTableClient({ membersHandle }: Props) {
	const { data } = useLiveFullMembers(membersHandle);
	return <MembersTableContent data={data} />;
}

function MembersTableContent({ data }: { data?: TeamMemberSchema[] }) {
	const [fuse] = useState(new Fuse(data ?? sampleMembers, { keys: ['name'] }));

	useEffect(() => {
		fuse.setCollection(data ?? sampleMembers);
	}, [data, fuse]);

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
		data: data ?? sampleMembers,
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
			<MembersTableButtons table={table} loading={data === undefined} />
			<Skeleton
				data={data ?? sampleMembers}
				sample={sampleMembers}
				loading={data === undefined}
				label='Loading members'
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
															'w-full': header.id === 'name',
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
											{/* All columns except for the hidden "signedInAt" column */}
											<TableCell colSpan={columns.length - 1} className='h-24 text-center'>
												No results
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</InnerTableContainer>

						<div className='flex items-center justify-between'>
							<TableSelectionStatus table={table} />
							<TablePagination table={table} />
						</div>
					</div>
				)}
			</Skeleton>
		</OuterTableContainer>
	);
}
