'use client';

import { Button } from '@/components/ui/button';
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/src/trpc/trpc-client';
import { formatDateRange } from '@/src/utils/date-format';
import type {
	MeetingAttendeeSchema,
	TeamMeetingSchema,
} from '@hours.frc.sh/api/app/meeting/schemas/team_meeting_schema';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import {
	type SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './meeting-attendee-table/columns';
import { MeetingDialogActions } from './meeting-dialog-actions';
import { MeetingDialogChangesContext } from './meeting-dialog-changes-context';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	meeting: TeamMeetingSchema;
	closeDialog: () => void;
};

export function MeetingDialogContent({ meeting, closeDialog, team }: Props) {
	const changes = useContext(MeetingDialogChangesContext);
	const [toastId, setToastId] = useState<string | number | undefined>();

	const submitChanges = trpc.teams.members.updateFinishedMeetings.useMutation({
		onMutate: (variables) => {
			setToastId(toast.loading(`Updating ${variables.length === 1 ? 'meeting' : 'meetings'}...`));
		},
		onSuccess: (_result, variables) => {
			toast.success(`Updated ${variables.length === 1 ? 'meeting' : 'meetings'}`, { id: toastId });
			closeDialog();
		},
		onError: (error, variables) => {
			toast.error(`An error occurred while updating ${variables.length === 1 ? 'the meeting' : 'the meetings'}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	if (meeting.attendees === undefined) {
		throw new RangeError('Expected attendees to be defined, is this meeting still in progress?');
	}

	const onSubmit = () => {
		const variables: Pick<MeetingAttendeeSchema, 'attendanceId' | 'startedAt' | 'endedAt'>[] = Object.entries(
			changes.updatedMeetings.meetings,
		)
			.filter(
				(
					entry,
				): entry is [MeetingAttendeeSchema['attendanceId'], Pick<MeetingAttendeeSchema, 'startedAt' | 'endedAt'>] =>
					Boolean(entry[1].startedAt && entry[1].endedAt),
			)
			.map(([attendanceId, dates]) => ({
				attendanceId,
				startedAt: dates.startedAt,
				endedAt: dates.endedAt,
			}));
		submitChanges.mutate(variables);
	};

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'name',
			desc: false,
		},
	]);

	const table = useReactTable({
		data: meeting.attendees,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
			pagination: { pageIndex: 0, pageSize: meeting.attendees.length },
		},
	});

	return (
		<DialogContent closeButton={false} className='max-w-max'>
			<div className='flex items-center justify-between'>
				<DialogHeader>
					<DialogTitle>Meeting from {formatDateRange(meeting.startedAt, meeting.endedAt, true)}</DialogTitle>
					<DialogDescription>Click on the start or end dates in a row to edit them.</DialogDescription>
				</DialogHeader>

				<MeetingDialogActions meeting={meeting} team={team} closeDialog={closeDialog} />
			</div>

			<ScrollArea className='max-h-96'>
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
						{table.getRowModel().rows?.length ? (
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</ScrollArea>

			<DialogFooter className='sm:justify-between'>
				<DialogClose asChild={true}>
					<Button variant='outline'>Cancel</Button>
				</DialogClose>

				<Button
					disabled={Object.keys(changes.updatedMeetings.meetings).length === 0 || submitChanges.isPending}
					onClick={onSubmit}
				>
					Save changes
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
