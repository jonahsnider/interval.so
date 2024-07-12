'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { DateTimePicker } from '@/src/components/date-time-picker';
import { TeamSlugContext } from '@/src/components/team-dashboard/team-slug-provider';
import { formatDuration } from '@/src/utils/date-format';
import type { AttendanceEntrySchema } from '@hours.frc.sh/api/app/team_member_attendance/schemas/attendance_entry_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { MeetingDialogChangesContext } from '../meeting-dialog-changes-context';
import { RowActionsDropdown } from './row-actions-dropdown';

export const columns: ColumnDef<AttendanceEntrySchema>[] = [
	{
		accessorKey: 'name',
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
			const changes = useContext(MeetingDialogChangesContext);
			const [startedAt, setStartedAt] = useState<Date | undefined>(row.original.startedAt);

			const onSelect = (value: Date | undefined) => {
				setStartedAt(value);

				changes.updateMeeting(row.original, { startedAt: value });
			};

			return (
				<DateTimePicker
					value={startedAt}
					buttonProps={{ variant: 'link' }}
					className={clsx('min-w-min w-full p-0 text-foreground font-normal', {
						'bg-destructive-muted': !startedAt,
					})}
					onSelect={onSelect}
					icon={false}
					verbose={true}
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
			const changes = useContext(MeetingDialogChangesContext);
			const [endedAt, setEndedAt] = useState<Date | undefined>(row.original.endedAt);

			const onSelect = (value: Date | undefined) => {
				setEndedAt(value);

				changes.updateMeeting(row.original, { endedAt: value });
			};

			return (
				<DateTimePicker
					value={endedAt}
					buttonProps={{ variant: 'link' }}
					className={clsx('min-w-min w-full p-0 text-foreground font-normal', {
						'bg-destructive-muted': !endedAt,
					})}
					onSelect={onSelect}
					icon={false}
					verbose={true}
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
