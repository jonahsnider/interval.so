import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { Link } from 'next-view-transitions';
import { Suspense } from 'react';
import { MemberAvatars } from '../../team-dashboard/member-avatars/member-avatars.server';
import { TeamCardDescription } from './team-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
};

export function TeamCard({ team }: Props) {
	const memberCountPromise = trpcServer.teams.members.simpleMemberList
		.query(team)
		.then((members) => count(members, (member) => member.atMeeting));

	return (
		<Link href={`/team/${team.slug}`} className='group'>
			<Card className='group-hover:bg-accent transition-all h-full'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle>{team.displayName}</CardTitle>
						<ArrowRightIcon className='h-6 w-6 text-muted-foreground group-hover:translate-x-[6px] transition-transform duration-200' />
					</div>
					<Suspense fallback={<Skeleton className='h-5 w-48' />}>
						<CardDescription>
							<TeamCardDescription team={team} initialMemberCountPromise={memberCountPromise} />
						</CardDescription>
					</Suspense>
				</CardHeader>

				<CardFooter>
					<MemberAvatars team={team} />
				</CardFooter>
			</Card>
		</Link>
	);
}
