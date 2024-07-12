'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/16/solid';
import type { MeetingAttendeeSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	attendee: Pick<MeetingAttendeeSchema, 'attendanceId' | 'member'>;
};

export function RowActionsDropdown({ attendee }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteAttendeeEntry = trpc.teams.members.deleteFinishedMeeting.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Deleting attendance record for ${attendee.member.name}...`));
		},
		onSuccess: () => {
			toast.success(`Deleted attendance record for ${attendee.member.name}`, { id: toastId });
		},
		onError: (error) => {
			toast.error(`An error occurred while deleting the attendance record for ${attendee.member.name}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
					<span className='sr-only'>Open menu</span>
					<EllipsisVerticalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					className='text-destructive focus:text-destructive focus:bg-destructive/10'
					onClick={() => deleteAttendeeEntry.mutate(attendee)}
				>
					<TrashIcon className='h-4 w-4 mr-2' />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
