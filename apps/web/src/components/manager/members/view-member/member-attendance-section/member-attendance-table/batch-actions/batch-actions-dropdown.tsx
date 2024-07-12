'use client';

import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import type { MembersTableMeetingRow } from '../columns';
import { BatchDeleteDialogContent, BatchDeleteItem } from './batch-delete-item';
import { MergeAttendanceEntriesItem } from './merge-attendance-entries-item';

type Props = {
	table: Table<MembersTableMeetingRow>;
};

export function BatchActionsDropdown({ table }: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const anySelection = table.getIsAllRowsSelected() || table.getIsSomeRowsSelected();

	return (
		<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild={true}>
					<Button size='icon' variant='ghost' disabled={!anySelection} className='h-8 w-8 p-0 transition-opacity'>
						<span className='sr-only'>Open menu</span>
						<EllipsisVerticalIcon className='h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end'>
					<MergeAttendanceEntriesItem table={table} />
					<DropdownMenuSeparator />
					<BatchDeleteItem setDialogOpen={setDialogOpen} />
				</DropdownMenuContent>
			</DropdownMenu>

			<BatchDeleteDialogContent table={table} setDialogOpen={setDialogOpen} />
		</AlertDialog>
	);
}
