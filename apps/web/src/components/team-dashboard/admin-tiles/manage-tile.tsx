import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { EndMeetingButton } from '../../admin/end-meeting-button/end-meeting-button';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManageTile({ team }: Props) {
	return (
		<Card className='h-full w-full flex flex-col justify-between'>
			<CardHeader>
				<CardTitle>Manage</CardTitle>
				<CardDescription>End the meeting by signing out all members</CardDescription>
			</CardHeader>

			<CardFooter>
				<EndMeetingButton width='full' team={team} />
			</CardFooter>
		</Card>
	);
}
