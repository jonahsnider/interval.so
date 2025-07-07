'use client';

import { TrashIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	meeting: TeamMeetingSchema;
	setDialogOpen: (open: boolean) => void;
};

export function DeleteMeetingItem({ meeting, team, setDialogOpen }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteOngoingMeeting = trpc.teams.meetings.deleteOngoingMeeting.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting meeting...'));
		},
		onSuccess: () => {
			toast.success('Meeting deleted', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the meeting', {
				description: error.message,
				id: toastId,
			});
		},
	});
	const deleteFinishedMeeting = trpc.teams.meetings.deleteFinishedMeeting.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting meeting...'));
		},
		onSuccess: () => {
			toast.success('Meeting deleted', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the meeting', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onClick = () => {
		const { endedAt } = meeting;

		if (endedAt) {
			deleteFinishedMeeting.mutate({
				team,
				meeting: {
					startedAt: meeting.startedAt,
					endedAt,
				},
			});
		} else {
			deleteOngoingMeeting.mutate({ team });
		}
	};

	return (
		<AlertDialog onOpenChange={setDialogOpen}>
			<AlertDialogTrigger asChild={true}>
				<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
					<TrashIcon className='h-4 w-4 mr-2' />
					Delete
				</DropdownMenuItem>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete meeting</AlertDialogTitle>
					<AlertDialogDescription>
						Permanently delete this meeting and all the sign-ins associated with it. This action is not reversible, so
						please continue with caution.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onClick} className={buttonVariants({ variant: 'destructive' })}>
						Delete meeting
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
