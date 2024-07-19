'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { TeamSlugContext } from '@/src/components/team-dashboard/team-slug-provider';
import { formatDate, formatDateRange, formatDuration } from '@/src/utils/date-format';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { type Duration, intervalToDuration, milliseconds } from 'date-fns';
import { type PropsWithChildren, useContext } from 'react';
import { MeetingDialog } from '../meeting-dialog/meeting-dialog';
import { RowActionsDropdown } from './row-actions/row-actions-dropdown';

function MeetingTitleTooltip({
	meeting,
	children,
}: PropsWithChildren<{ meeting: Pick<TeamMeetingSchema, 'startedAt' | 'endedAt'> }>) {
	const shortContent = formatDateRange(meeting.startedAt, meeting.endedAt);
	const verboseContent = formatDateRange(meeting.startedAt, meeting.endedAt, true);

	if (shortContent === verboseContent) {
		return children;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild={true}>{children}</TooltipTrigger>
			<TooltipContent>{verboseContent}</TooltipContent>
		</Tooltip>
	);
}

export const columns: ColumnDef<TeamMeetingSchema>[] = [
	{
		id: 'title',
		accessorFn: (meeting) => formatDateRange(meeting.startedAt, meeting.endedAt),
		header: 'Title',
		cell: ({ getValue, row }) => {
			const shortContent = getValue<string>();
			const { team } = useContext(TeamSlugContext);

			if (!team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			const inner = (
				<>
					{/* Ongoing meetings don't get a dialog */}
					{!row.original.endedAt && (
						<MeetingTitleTooltip meeting={row.original}>
							<p className='font-medium'>{shortContent}</p>
						</MeetingTitleTooltip>
					)}
					{row.original.endedAt && (
						<MeetingDialog meeting={row.original} team={team}>
							<Button variant='link' className='p-0 font-medium text-foreground'>
								<MeetingTitleTooltip meeting={row.original}>
									<span>{shortContent}</span>
								</MeetingTitleTooltip>
							</Button>
						</MeetingDialog>
					)}
				</>
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
			const { team } = useContext(TeamSlugContext);

			if (!team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return (
				<div className='text-right'>
					<RowActionsDropdown meeting={row.original} team={team} />
				</div>
			);
		},
	},
];
