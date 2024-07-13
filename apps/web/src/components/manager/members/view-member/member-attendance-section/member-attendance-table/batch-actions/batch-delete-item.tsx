import {
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { TrashIcon } from '@heroicons/react/16/solid';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import type { MembersTableMeetingRow } from '../columns';

export function BatchDeleteItem({
	setDialogOpen,
}: {
	setDialogOpen: (open: boolean) => void;
}) {
	return (
		<DropdownMenuItem
			className='text-destructive focus:text-destructive focus:bg-destructive/10'
			onClick={() => setDialogOpen(true)}
		>
			<TrashIcon className='h-4 w-4 mr-2' />
			Delete
		</DropdownMenuItem>
	);
}

export function BatchDeleteDialogContent({
	table,
	setDialogOpen,
}: {
	table: Table<MembersTableMeetingRow>;
	setDialogOpen: (open: boolean) => void;
}) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const selectedRows = table.getSelectedRowModel().rows;

	const deleteAttendance = trpc.teams.members.attendance.deleteEntries.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting attendance entries...', { id: toastId }));
		},
		onSuccess: () => {
			toast.success(`Deleted ${selectedRows.length} attendance entries`, { id: toastId });

			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the attendance entries', {
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
					Permanently delete these attendance entries. This action is not reversible, so please continue with caution.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>

				<Button
					variant='destructive'
					onClick={() => deleteAttendance.mutate(selectedRows.map((row) => row.original))}
					disabled={deleteAttendance.isPending}
				>
					Delete attendance entries
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}
