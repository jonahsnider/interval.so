'use client';

import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EndMeetingAlert } from '../../../end-meeting-alert';
import { DeleteMeetingItem } from './delete-meeting-item';
import { EndMeetingItem } from './end-meeting-item';

type Props = {
	meeting: TeamMeetingSchema;
	team: Pick<TeamSchema, 'slug'>;
};

export function RowActionsDropdown({ meeting, team }: Props) {
	const [isEndMeetingAlertOpen, setIsEndMeetingAlertOpen] = useState(false);
	const [isDeleteMeetingAlertOpen, setIsDeleteMeetingAlertOpen] = useState(false);

	return (
		<>
			<EndMeetingAlert
				team={team}
				open={isEndMeetingAlertOpen}
				onOpenChange={setIsEndMeetingAlertOpen}
				meetingStart={meeting.startedAt}
			/>

			<DropdownMenu open={isEndMeetingAlertOpen || isDeleteMeetingAlertOpen ? true : undefined}>
				<DropdownMenuTrigger asChild={true}>
					<Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
						<span className='sr-only'>Open menu</span>
						<EllipsisVerticalIcon className='h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					{!meeting.endedAt && (
						<>
							<EndMeetingItem setDialogOpen={setIsEndMeetingAlertOpen} />
							<DropdownMenuSeparator />
						</>
					)}

					<DeleteMeetingItem meeting={meeting} team={team} setDialogOpen={setIsDeleteMeetingAlertOpen} />
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
