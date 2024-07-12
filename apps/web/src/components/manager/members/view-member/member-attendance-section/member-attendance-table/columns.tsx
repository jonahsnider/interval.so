'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { formatDuration } from '@/src/utils/date-format';
import type { AttendanceEntrySchema } from '@hours.frc.sh/api/app/team_member_attendance/schemas/attendance_entry_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import { MeetingDateRangePicker } from '../meeting-date-range-picker';
import { BatchActionsDropdown } from './batch-actions/batch-actions-dropdown';
import { RowActionsDropdown } from './row-actions-dropdown';

export type MembersTableMeetingRow = Pick<AttendanceEntrySchema, 'startedAt' | 'endedAt' | 'attendanceId'>;

export const columns: ColumnDef<MembersTableMeetingRow>[] = [
	{
		id: 'select',
		header: ({ table }) => {
			return (
				<Checkbox
					checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label='Select all'
				/>
			);
		},
		cell: ({ row }) => {
			return (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label='Select row'
				/>
			);
		},
		enableSorting: false,
		enableHiding: false,
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
		id: 'duration',
		accessorFn: (meeting) =>
			intervalToDuration({
				start: meeting.startedAt,
				end: meeting.endedAt,
			}),
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
		header: ({ table }) => {
			return (
				<div className='text-right'>
					<BatchActionsDropdown table={table} />
				</div>
			);
		},
		cell: ({ row }) => {
			return (
				<div className='text-right'>
					<RowActionsDropdown row={row.original} />
				</div>
			);
		},
	},
];
