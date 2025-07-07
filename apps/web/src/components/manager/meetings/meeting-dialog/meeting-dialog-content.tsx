'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
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
import { formatDateRange } from '@/src/utils/date-format';
import { MeetingAttendeeTable } from './meeting-attendee-table/meeting-attendee-table';
import { MeetingDialogActions } from './meeting-dialog-actions';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	meeting: TeamMeetingSchema;
	closeDialog: () => void;
};

export function MeetingDialogContent({ meeting, closeDialog, team }: Props) {
	return (
		<DialogContent closeButton={false} className='max-w-max'>
			<div className='flex items-center justify-between'>
				<DialogHeader>
					<DialogTitle>Meeting from {formatDateRange(meeting.startedAt, meeting.endedAt, true)}</DialogTitle>
					<DialogDescription>Click on the start or end dates in a row to edit them.</DialogDescription>
				</DialogHeader>

				<MeetingDialogActions meeting={meeting} team={team} closeDialog={closeDialog} />
			</div>

			<ScrollArea className='max-h-[32rem]'>
				<MeetingAttendeeTable meeting={meeting} />
			</ScrollArea>

			<DialogFooter>
				<DialogClose asChild={true}>
					<Button variant='outline' className='w-full'>
						Close
					</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	);
}
