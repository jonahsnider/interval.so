'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { ArchiveBoxArrowDownIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	member: TeamMemberSchema;
};

export function ArchiveMemberItem({ member }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const mutation = trpc.teams.members.setArchived.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Archiving ${member.name}...`));
		},
		onSuccess: () => {
			toast.success(`Archived ${member.name}`, { id: toastId });
			router.refresh();
		},
		onError: (error) => {
			toast.error(`An error occurred while archiving ${member.name}`, {
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
