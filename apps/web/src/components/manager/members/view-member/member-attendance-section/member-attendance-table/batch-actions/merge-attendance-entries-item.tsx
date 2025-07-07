import { Square3Stack3DIcon } from '@heroicons/react/16/solid';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import type { MembersTableMeetingRow } from '../columns';

type Props = {
	table: Table<MembersTableMeetingRow>;
};

export function MergeAttendanceEntriesItem({ table }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const selectedRows = table.getSelectedRowModel().rows;

	const mutation = trpc.teams.members.attendance.mergeEntries.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Merging ${selectedRows.length} attendance entries...`, { id: toastId }));
		},
		onSuccess: () => {
			toast.success(`Merged ${selectedRows.length} attendance entries`, { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while merging the attendance entries', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenuItem
			disabled={selectedRows.length < 2}
			onClick={() => mutation.mutate(selectedRows.map((row) => ({ attendanceId: row.original.attendanceId })))}
		>
			<Square3Stack3DIcon className='h-4 w-4 mr-2' />
			Merge
		</DropdownMenuItem>
	);
}
