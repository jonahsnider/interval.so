'use client';

import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import type { MembersTableMeetingRow } from './columns';

type Props = {
	row: Pick<MembersTableMeetingRow, 'attendanceId'>;
};

export function RowActionsDropdown({ row }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteAttendeeEntry = trpc.teams.members.attendance.deleteEntries.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting attendance record...'));
		},
		onSuccess: () => {
			toast.success('Deleted attendance record', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the attendance record', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onClick = () => {
		const { attendanceId } = row;
		if (!attendanceId) {
			throw new TypeError('Expected attendance ID to be defined for non draft row');
		}

		deleteAttendeeEntry.mutate([{ attendanceId }]);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
					<span className='sr-only'>Open menu</span>
					<EllipsisVerticalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10' onClick={onClick}>
					<TrashIcon className='h-4 w-4 mr-2' />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
