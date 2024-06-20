'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { TeamMeetingSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';

type Props = {
	meeting: TeamMeetingSchema;
};

export function DeleteMeetingItem({ meeting }: Props) {
	return (
		<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
			Delete meeting
		</DropdownMenuItem>
	);
}
