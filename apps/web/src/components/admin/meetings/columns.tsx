'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatDateRange, formatDuration } from '@/src/utils/date-format';
import { ArrowDownIcon, ArrowUpIcon, ChevronUpDownIcon, EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { Column, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import type { PropsWithChildren } from 'react';

export type Meeting = {
	attendeeCount: number;
	start: Date;
	end?: Date;
};

function SortableHeader({
	column,
	children,
	side = 'left',
}: PropsWithChildren<{ column: Column<Meeting>; side?: 'left' | 'right' }>) {
	return (
		<div className={clsx({ 'text-right': side === 'right' })}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild={true}>
					<Button
						variant='ghost'
						size='sm'
						className={clsx('text-sm', {
							'-ml-3': side === 'left',
						})}
					>
						{children}
						{column.getIsSorted() === 'asc' && <ArrowUpIcon className='ml-2 h-4 w-4' />}
						{column.getIsSorted() === 'desc' && <ArrowDownIcon className='ml-2 h-4 w-4' />}
						{column.getIsSorted() === false && <ChevronUpDownIcon className='ml-2 h-4 w-4' />}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem className='flex items-center gap-2' onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className='h-4 w-4 text-muted-foreground' />
						Ascending
					</DropdownMenuItem>
					<DropdownMenuItem className='flex items-center gap-2' onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className='h-4 w-4 text-muted-foreground' />
						Descending
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function inDateRange(date: Date, [start, end]: [Date | undefined, Date | undefined]): boolean {
	if (start && end) {
		return date >= start && date <= end;
	}

	if (start) {
		return date >= start;
	}

	if (end) {
		return date <= end;
	}

	return true;
}

export const columns: ColumnDef<Meeting>[] = [
	{
		id: 'title',
		accessorFn: (meeting) => formatDateRange(meeting.start, meeting.end),
		header: 'Title',
		cell: ({ getValue, row }) => {
			return (
				<div className='flex items-center gap-2'>
					<p className='font-medium'>{getValue<string>()}</p>
					{row.original.end === undefined && <Badge className='hover:bg-primary uppercase'>Live</Badge>}
				</div>
			);
		},
	},
	{
		accessorKey: 'attendeeCount',
		header: ({ column }) => {
			return (
				<SortableHeader column={column} side='right'>
					Attendees
				</SortableHeader>
			);
		},
		cell: ({ row }) => {
			// Padding to align with the end of the button text
			return <p className='text-right pr-4'>{row.original.attendeeCount.toLocaleString()}</p>;
		},
	},
	{
		accessorKey: 'start',
		filterFn: (row, _columnId, filterValue: [Date | undefined, Date | undefined]) => {
			const [start, end] = filterValue;

			return inDateRange(row.original.start, [start, end]);
		},
		header: ({ column }) => {
			return <SortableHeader column={column}>Start</SortableHeader>;
		},
		cell: ({ row }) => {
			return <p>{formatDate(row.original.start)}</p>;
		},
	},
	{
		accessorKey: 'end',
		filterFn: (row, _columnId, filterValue: [Date | undefined, Date | undefined]) => {
			const [start, end] = filterValue;

			return inDateRange(row.original.start, [start, end]);
		},
		header: ({ column }) => {
			return <SortableHeader column={column}>End</SortableHeader>;
		},
		cell: ({ row }) => {
			if (row.original.end) {
				return <p>{formatDate(row.original.end)}</p>;
			}
		},
	},
	{
		accessorFn: (meeting) =>
			intervalToDuration({
				start: meeting.start,
				end: meeting.end ?? new Date(),
			}),
		id: 'duration',
		sortingFn: (aRow, bRow) => {
			const a = aRow.getValue<Duration>('duration');
			const b = bRow.getValue<Duration>('duration');

			return milliseconds(a) - milliseconds(b);
		},
		header: ({ column }) => {
			return <SortableHeader column={column}>Duration</SortableHeader>;
		},
		cell: ({ getValue }) => {
			const duration = getValue<Duration>();

			return <p>{formatDuration(duration)}</p>;
		},
	},
	{
		id: 'actions',
		cell: () => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild={true}>
						<Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
							<span className='sr-only'>Open menu</span>
							<EllipsisVerticalIcon className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
							Delete meeting
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
