import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpcServer } from '@/src/trpc/trpc-server';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { Link } from 'next-view-transitions';
import { MemberAvatars } from '../../team-dashboard/member-avatars/member-avatars.server';

type Props = {
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
};

// TODO: Make this realtime
export async function TeamCard({ team }: Props) {
	const attendance = await trpcServer.teams.members.simpleMemberList.query(team);

	const memberCount = count(attendance, (member) => member.atMeeting);

	return (
		<Link href={`/team/${team.slug}`} className='group'>
			<Card className='group-hover:bg-accent transition-all h-full'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle>{team.displayName}</CardTitle>
						<ArrowRightIcon className='h-6 w-6 text-muted-foreground group-hover:translate-x-[6px] transition-transform duration-200' />
					</div>
					<CardDescription>
						{memberCount === 0 && 'No members signed in currently'}
						{memberCount === 1 && '1 member signed in'}
						{memberCount > 1 && `${memberCount} members signed in`}
					</CardDescription>
				</CardHeader>

				<CardFooter>
					<MemberAvatars team={team} />
				</CardFooter>
			</Card>
		</Link>
	);
}
