import { ArchiveBoxIcon, ArrowUpIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	table: Table<TeamMemberSchema>;
};

export function BatchArchiveItem({ table }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const selectedRows = table.getSelectedRowModel().rows;

	const mutation = trpc.teams.members.setArchivedMany.useMutation({
		onMutate: ({ data }) => {
			setToastId(toast.loading(`${data.archived ? 'Archiving' : 'Unarchiving'} members...`, { id: toastId }));
		},
		onSuccess: (_result, { data }) => {
			toast.success(`${data.archived ? 'Archived' : 'Unarchived'} ${selectedRows.length} members`, { id: toastId });
		},
		onError: (error, { data }) => {
			toast.error(`An error occurred while ${data.archived ? 'archiving' : 'unarchiving'} the members`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	const data = selectedRows.some((row) => row.original.archived) ? { archived: false } : { archived: true };

	return (
		<DropdownMenuItem
			onClick={() => mutation.mutate({ members: selectedRows.map((row) => ({ id: row.original.id })), data })}
		>
			{data.archived && <ArchiveBoxIcon className='h-4 w-4 mr-2' />}
			{!data.archived && <ArrowUpIcon className='h-4 w-4 mr-2' />}
			{data.archived ? 'Archive' : 'Unarchive'}
		</DropdownMenuItem>
	);
}
