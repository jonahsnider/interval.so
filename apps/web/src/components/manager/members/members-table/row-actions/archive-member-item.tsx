'use client';

import { ArchiveBoxArrowDownIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	member: Pick<TeamMemberSchema, 'id' | 'name' | 'archived'>;
};

export function ArchiveMemberItem({ member }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const mutation = trpc.teams.members.setArchived.useMutation({
		onMutate: ({ archived }) => {
			setToastId(toast.loading(`${archived ? 'Archiving' : 'Unarchiving'} ${member.name}...`));
		},
		onSuccess: (_result, { archived }) => {
			toast.success(`${archived ? 'Archived' : 'Unarchived'} ${member.name}`, { id: toastId });
		},
		onError: (error, { archived }) => {
			toast.error(`An error occurred while ${archived ? 'archiving' : 'unarchiving'} ${member.name}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenuItem
			onClick={() =>
				mutation.mutate({
					id: member.id,
					archived: !member.archived,
				})
			}
		>
			<ArchiveBoxArrowDownIcon className='h-4 w-4 mr-2' />
			{member.archived ? 'Unarchive' : 'Archive'}
		</DropdownMenuItem>
	);
}
