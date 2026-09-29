import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/src/trpc/trpc-client';

type Props = {
	meeting: TeamMeetingSchema;
	team: Pick<TeamSchema, 'slug'>;
	closeDialog: () => void;
};

export function MeetingDialogActions({ meeting, team, closeDialog }: Props) {
	const trpc = useTRPC();
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteMeeting = useMutation(
		trpc.teams.meetings.deleteFinishedMeeting.mutationOptions({
			onMutate: () => {
				setToastId(toast.loading('Deleting meeting...'));
			},
			onSuccess: () => {
				toast.success('Meeting deleted', { id: toastId });
				closeDialog();
			},
			onError: (error) => {
				toast.error('An error occurred while deleting the meeting', {
					description: error.message,
					id: toastId,
				});
			},
		}),
	);

	if (!meeting.endedAt) {
		// Shouldn't ever happened since this was designed for finished meetings only
		return undefined;
	}

	const onClick = () => {
		deleteMeeting.mutate({
			team,
			meeting,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button size='icon' variant='ghost' className='h-8 w-8 p-0'>
					<EllipsisVerticalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end'>
				<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10' onClick={onClick}>
					<TrashIcon className='h-4 w-4 mr-2' />
					Delete meeting
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
