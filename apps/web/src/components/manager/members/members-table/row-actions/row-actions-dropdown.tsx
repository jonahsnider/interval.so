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
import { useState } from 'react';
import { ArchiveMemberItem } from './archive-member-item';
import { DeleteMemberItem } from './delete-member-item';
import { UpdateAttendanceItem } from './update-attendance-item';

type Props = {
	member: TeamMemberSchema;
};

export function RowActionsDropdown({ member }: Props) {
	const [isDeleteMemberAlertOpen, setDeleteMemberAlertOpen] = useState(false);

	return (
		<DropdownMenu open={isDeleteMemberAlertOpen ? true : undefined}>
			<DropdownMenuTrigger asChild={true}>
				<Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
					<span className='sr-only'>Open menu</span>
					<EllipsisVerticalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<UpdateAttendanceItem member={member} />
				<DropdownMenuSeparator />
				<ArchiveMemberItem member={member} />
				<DeleteMemberItem member={member} setDialogOpen={setDeleteMemberAlertOpen} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
