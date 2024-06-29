'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { BatchArchiveItem } from './batch-archive-item';
import { BatchDeleteItem } from './batch-delete-item';
import { BatchUpdateAttendanceItem } from './batch-update-attendance-item';

type Props = {
	table: Table<TeamMemberSchema>;
};

export function BatchActionsDropdown({ table }: Props) {
	const [isDeleteMembersAlertOpen, setDeleteMembersAlertOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const anySelection = table.getIsAllRowsSelected() || table.getIsSomeRowsSelected();

	return (
		<DropdownMenu open={isDeleteMembersAlertOpen ? true : dropdownOpen} onOpenChange={setDropdownOpen}>
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
				<BatchDeleteItem
					setDialogOpen={setDeleteMembersAlertOpen}
					table={table}
					closeDropdown={() => setDropdownOpen(false)}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
