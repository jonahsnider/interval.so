import {
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
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';

export function BatchDeleteItem() {
	return (
		<AlertDialogTrigger asChild={true}>
			<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
				<TrashIcon className='h-4 w-4 mr-2' />
				Delete
			</DropdownMenuItem>
		</AlertDialogTrigger>
	);
}

type Props = {
	setDialogOpen: (open: boolean) => void;
	table: Table<TeamMemberSchema>;
};

export function BatchDeleteDialogContent({ setDialogOpen, table }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const selectedRows = table.getSelectedRowModel().rows;

	const deleteMembers = trpc.teams.members.deleteMany.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting members...', { id: toastId }));
		},
		onSuccess: () => {
			toast.success(`Deleted ${selectedRows.length} members`, { id: toastId });
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the members', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Delete members</AlertDialogTitle>
				<AlertDialogDescription>
					Permanently delete these members and all of their recorded meetings. This action is not reversible, so please
					continue with caution.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction
					className={buttonVariants({ variant: 'destructive' })}
					onClick={() => deleteMembers.mutate({ members: selectedRows.map((row) => ({ id: row.original.id })) })}
					disabled={deleteMembers.isPending}
				>
					Delete members
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}
