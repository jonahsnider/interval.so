'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { formatDate, formatDateRange, formatDuration } from '@/src/utils/date-format';
import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import { useParams } from 'next/navigation';
import { RowActionsDropdown } from './row-actions/row-actions-dropdown';

export const columns: ColumnDef<TeamMeetingSchema>[] = [
	{
		id: 'title',
		accessorFn: (meeting) => formatDateRange(meeting.startedAt, meeting.endedAt),
		header: 'Title',
		cell: ({ getValue, row }) => {
			const shortContent = getValue<string>();
			const verboseContent = formatDateRange(row.original.startedAt, row.original.endedAt, true);

			const inner =
				shortContent === verboseContent ? (
					<p className='font-medium'>{shortContent}</p>
				) : (
					<Tooltip>
						<TooltipTrigger asChild={true}>
							<p className='font-medium'>{shortContent}</p>
						</TooltipTrigger>
						<TooltipContent>{verboseContent}</TooltipContent>
					</Tooltip>
				);

			if (row.original.endedAt) {
				return inner;
			}

			return (
				<div className='flex items-center gap-2'>
					{inner}

					<Badge className='hover:bg-primary uppercase'>Live</Badge>
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
		accessorKey: 'startedAt',
		sortingFn: Sort.ascending((row) => row.original.startedAt),
		header: ({ column }) => {
			return <SortableHeader column={column}>Start</SortableHeader>;
		},
		cell: ({ row }) => {
			const shortContent = formatDate(row.original.startedAt);
			const verboseContent = formatDate(row.original.startedAt, true);

			if (shortContent === verboseContent) {
				return <p>{shortContent}</p>;
			}

			return (
				<Tooltip>
					<TooltipTrigger asChild={true}>
						<p>{shortContent}</p>
					</TooltipTrigger>
					<TooltipContent>{verboseContent}</TooltipContent>
				</Tooltip>
			);
		},
	},
	{
		accessorKey: 'endedAt',
		// If the meeting is still in progress, treat it as though it had just ended
		// With the default sort, this means it'll be at the top of the list
		sortingFn: Sort.ascending((row) => row.original.endedAt ?? new Date()),
		header: ({ column }) => {
			return <SortableHeader column={column}>End</SortableHeader>;
		},
		cell: ({ row }) => {
			if (row.original.endedAt) {
				const shortContent = formatDate(row.original.endedAt);
				const verboseContent = formatDate(row.original.endedAt, true);

				if (shortContent === verboseContent) {
					return <p>{shortContent}</p>;
				}

				return (
					<Tooltip>
						<TooltipTrigger asChild={true}>
							<p>{shortContent}</p>
						</TooltipTrigger>
						<TooltipContent>{verboseContent}</TooltipContent>
					</Tooltip>
				);
			}
		},
	},
	{
		accessorFn: (meeting) =>
			intervalToDuration({
				start: meeting.startedAt,
				end: meeting.endedAt ?? new Date(),
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
			const params = useParams<{ team: string }>();

			if (!params.team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return <RowActionsDropdown meeting={row.original} team={{ slug: params.team }} />;
		},
	},
];
