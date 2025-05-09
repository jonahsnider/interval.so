'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { TeamSlugContext } from '@/src/components/team-dashboard/team-slug-provider';
import { formatDuration } from '@/src/utils/date-format';
import type { AttendanceEntrySchema } from '@interval.so/api/app/team_member_attendance/schemas/attendance_entry_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import Link from 'next/link';
import { useContext } from 'react';
import { MeetingDateRangePicker } from '../../../members/view-member/member-attendance-section/meeting-date-range-picker';
import { RowActionsDropdown } from './row-actions-dropdown';

// TODO: If you edit the start time of a the earliest entry, or the end time of the last entry, the modal will close because the start-end range is different
// Ideally the client could tell when it was going to change the start/end time of the meeting, and update the selected modal time range to match the new time span

export const columns: ColumnDef<AttendanceEntrySchema>[] = [
	{
		id: 'name',
		accessorKey: 'member.name',
		header: ({ column }) => {
			return <SortableHeader column={column}>Name</SortableHeader>;
		},
		cell: ({ row }) => {
			const { team } = useContext(TeamSlugContext);

			if (!team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return (
				<Link
					className={cn(buttonVariants({ variant: 'link' }), 'text-foreground p-0')}
					href={`/team/${team.slug}/dashboard/members/${row.original.member.id}`}
				>
					{row.original.member.name}
				</Link>
			);
		},
	},
	{
		accessorKey: 'startedAt',
		sortingFn: Sort.ascending((row) => row.original.startedAt),
		header: ({ column }) => {
			return <SortableHeader column={column}>Signed in</SortableHeader>;
		},
		cell: ({ row }) => {
			return (
				<MeetingDateRangePicker
					display='start'
					meeting={row.original}
					icon={false}
					verbose={true}
					buttonProps={{ variant: 'link' }}
					className={'min-w-min p-0 text-foreground font-normal'}
				/>
			);
		},
	},
	{
		accessorKey: 'endedAt',
		sortingFn: Sort.ascending((row) => row.original.endedAt),
		header: ({ column }) => {
			return <SortableHeader column={column}>Signed out</SortableHeader>;
		},
		cell: ({ row }) => {
			return (
				<MeetingDateRangePicker
					display='end'
					meeting={row.original}
					icon={false}
					verbose={true}
					buttonProps={{ variant: 'link' }}
					className={'min-w-min p-0 text-foreground font-normal'}
				/>
			);
		},
	},
	{
		accessorFn: (meeting) =>
			intervalToDuration({
				start: meeting.startedAt,
				end: meeting.endedAt,
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
		cell: ({ row }) => {
			return <RowActionsDropdown attendanceEntry={row.original} />;
		},
	},
];
