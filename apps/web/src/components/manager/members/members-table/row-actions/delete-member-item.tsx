'use client';

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
import { TrashIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	member: Pick<TeamMemberSchema, 'id' | 'name'>;
	setDialogOpen: (open: boolean) => void;
};

export function DeleteMemberItem({ member, setDialogOpen }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteMember = trpc.teams.members.delete.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Deleting ${member.name}...`, { id: toastId }));
		},
		onSuccess: () => {
			setToastId(toast.success(`Deleted ${member.name}`, { id: toastId }));
		},
		onError: (error) => {
			setToastId(
				toast.error(`An error occurred while deleting ${member.name}`, {
					description: error.message,
					id: toastId,
				}),
			);
		},
	});

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
					<AlertDialogTitle>Delete member</AlertDialogTitle>
					<AlertDialogDescription>
						Permanently delete this member and all of their recorded meetings. This action is not reversible, so please
						continue with caution.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => deleteMember.mutate({ id: member.id })}
						className={buttonVariants({ variant: 'destructive' })}
					>
						Delete {member.name}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
