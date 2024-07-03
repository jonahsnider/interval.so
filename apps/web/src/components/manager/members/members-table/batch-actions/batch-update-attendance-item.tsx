import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	table: Table<TeamMemberSchema>;
};

export function BatchUpdateAttendanceItem({ table }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const selectedRows = table.getSelectedRowModel().rows;

	const mutation = trpc.teams.members.updateAttendanceMany.useMutation({
		onMutate: ({ data }) => {
			setToastId(toast.loading(`${data.atMeeting ? 'Signing in' : 'Signing out'} members...`, { id: toastId }));
		},
		onSuccess: (_result, { data }) => {
			toast.success(`Signed ${selectedRows.length} members ${data.atMeeting ? 'in' : 'out'}`, { id: toastId });
		},
		onError: (error, { data }) => {
			toast.error(`An error occurred while ${data.atMeeting ? 'signing in' : 'signing out'} the members`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	const data = selectedRows.some((row) => row.original.atMeeting) ? { atMeeting: false } : { atMeeting: true };

	return (
		<DropdownMenuItem
			onClick={() => mutation.mutate({ members: selectedRows.map((row) => ({ id: row.original.id })), data })}
		>
			{data.atMeeting && <ArrowLeftEndOnRectangleIcon className='h-4 w-4 mr-2' />}
			{!data.atMeeting && <ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />}
			Sign {data.atMeeting ? 'in' : 'out'}
		</DropdownMenuItem>
	);
}
