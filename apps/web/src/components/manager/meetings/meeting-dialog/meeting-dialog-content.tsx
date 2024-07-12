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
import { trpc } from '@/src/trpc/trpc-client';
import { formatDateRange } from '@/src/utils/date-format';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type {
	MeetingAttendeeSchema,
	TeamMeetingSchema,
} from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { MeetingAttendeeTable } from './meeting-attendee-table/meeting-attendee-table';
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
				<MeetingAttendeeTable meeting={meeting} />
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
