import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EndMeetingButton } from '../../manager/end-meeting-button/end-meeting-button';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManageTile({ team }: Props) {
	return (
		<Card className='h-full w-full flex flex-col justify-between col-span-1 xs:col-span-2 md:col-span-1'>
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
