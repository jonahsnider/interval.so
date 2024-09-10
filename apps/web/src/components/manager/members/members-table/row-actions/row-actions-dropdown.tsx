'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import clsx from 'clsx';
import { useState } from 'react';
import { ArchiveMemberItem } from './archive-member-item';
import { DeleteMemberItem } from './delete-member-item';
import { UpdateAttendanceItem } from './update-attendance-item';
import { ViewMemberItem } from './view-member-item';

type Props = {
	member: Pick<TeamMemberSchema, 'id' | 'name' | 'signedInAt' | 'archived'>;
} & (
	| {
			// This is only used for the "View" item, which takes you to the standalone view member page
			variant?: 'table';
			team: Pick<TeamSchema, 'slug'>;
	  }
	| {
			variant: 'standalone';
			team?: undefined;
	  }
);

/** Dropdown with actions for a specific member. Used in the members table and on the standalone view member page. */
export function MemberRowActionsDropdown({ member, team, variant = 'table' }: Props) {
	const [isDeleteMemberAlertOpen, setDeleteMemberAlertOpen] = useState(false);

	return (
		<DropdownMenu open={isDeleteMemberAlertOpen ? true : undefined}>
			<DropdownMenuTrigger asChild={true}>
				<Button
					variant={variant === 'table' ? 'ghost' : 'outline'}
					size='icon'
					className={clsx({ 'h-8 w-8 p-0': variant === 'table' })}
				>
					<span className='sr-only'>Open menu</span>
					<EllipsisVerticalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				{team && <ViewMemberItem team={team} member={member} />}
				<UpdateAttendanceItem member={member} />
				<DropdownMenuSeparator />
				<ArchiveMemberItem member={member} />
				<DeleteMemberItem member={member} setDialogOpen={setDeleteMemberAlertOpen} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
