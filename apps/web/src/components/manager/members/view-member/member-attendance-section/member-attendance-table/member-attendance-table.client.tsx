'use client';

import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import type { AttendanceEntrySchema } from '@interval.so/api/app/team_member_attendance/schemas/attendance_entry_schema';
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { Skeleton } from 'skullet/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/src/components/data-tables/table-pagination';
import { TableSelectionStatus } from '@/src/components/data-tables/table-selection-status';
import { toTimeFilter } from '@/src/components/manager/period-select/duration-slug';
import { useLiveAttendance } from '@/src/trpc/live-queries';
import { searchParamParsers } from '../../search-params';
import { columns } from './columns';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	initialMeetings: Pick<AttendanceEntrySchema, 'attendanceId' | 'startedAt' | 'endedAt'>[];
};

const sampleAttendance: Props['initialMeetings'] = Array.from({ length: 10 }, (_, index) => ({
	attendanceId: `sample-attendance-${index}`,
	startedAt: new Date('2026-01-15T17:00:00Z'),
	endedAt: new Date('2026-01-15T19:00:00Z'),
}));

export function MemberAttendanceTableLoading() {
	return <MemberAttendanceTableContent />;
}

export function MemberAttendanceTableClient({ initialMeetings, member }: Props) {
	const [searchParams] = useQueryStates(searchParamParsers);
	const timeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);

	const { data } = useLiveAttendance({ member, timeFilter }, initialMeetings);
	return <MemberAttendanceTableContent data={data} />;
}

function MemberAttendanceTableContent({ data }: { data?: Props['initialMeetings'] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'startedAt',
			desc: true,
		},
	]);

	const table = useReactTable({
		data: data ?? sampleAttendance,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getRowId: (attendance) => attendance.attendanceId,
		state: {
			sorting,
		},
	});

	return (
		<Skeleton
			data={data ?? sampleAttendance}
			sample={sampleAttendance}
			loading={data === undefined}
			label='Loading attendance'
		>
			{() => (
				<div className='flex flex-col gap-4'>
					<div className='rounded-md border bg-background overflow-hidden'>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
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
												<TableCell key={cell.id} className='py-0.5'>
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
					</div>

					<div className='flex items-center justify-between flex-wrap text-nowrap gap-2'>
						<TableSelectionStatus table={table} />
						<TablePagination table={table} />
					</div>
				</div>
			)}
		</Skeleton>
	);
}
