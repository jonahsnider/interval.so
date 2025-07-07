'use client';

import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BatchArchiveItem } from './batch-archive-item';
import { BatchDeleteDialogContent, BatchDeleteItem } from './batch-delete-item';
import { BatchUpdateAttendanceItem } from './batch-update-attendance-item';

type Props = {
	table: Table<TeamMemberSchema>;
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
					<BatchUpdateAttendanceItem table={table} />
					<BatchArchiveItem table={table} />
					<DropdownMenuSeparator />
					<BatchDeleteItem />
				</DropdownMenuContent>
			</DropdownMenu>

			<BatchDeleteDialogContent table={table} setDialogOpen={setDialogOpen} />
		</AlertDialog>
	);
}
