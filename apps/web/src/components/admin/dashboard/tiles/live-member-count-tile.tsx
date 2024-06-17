import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { Suspense } from 'react';

type Props = { team: Pick<TeamSchema, 'slug'> };

export function LiveMemberCountTile({ team }: Props) {
	return (
		<Suspense fallback={<LiveMemberCountTileSkeleton />}>
			<LiveMemberCountTileFetcher team={team} />
		</Suspense>
	);
}

async function LiveMemberCountTileFetcher({ team }: Props) {
	const data = await trpcServer.teams.members.simpleMemberList.query({ slug: team.slug });

	const current = count(data, (member) => member.atMeeting);
	const max = data.length;

	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardDescription className='text-base'>Signed-in members</CardDescription>

					<Badge className='hover:bg-primary shadow-none uppercase'>Live</Badge>
				</div>
				<CardTitle className='text-4xl'>
					{current}/{max} members
				</CardTitle>
			</CardHeader>
			{/* Height matches the height of the text in the other tiles */}
			<CardFooter className='min-h-10'>
				{/* Min height is used to align this with where text is in the other tiles */}

				{/* Avoid having a NaN value that causes the progress bar to be stuck at 100% */}
				<Progress value={current} max={max === 0 ? 1 : max} />
			</CardFooter>
		</Card>
	);
}

function LiveMemberCountTileSkeleton() {
	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<Skeleton className='w-48 h-6' />

					<Skeleton className='w-12 h-6' />
				</div>
				<Skeleton className='w-60 h-10' />
			</CardHeader>
			{/* Height matches the height of the text in the other tiles */}
			<CardFooter className='min-h-10'>
				{/* Min height is used to align this with where text is in the other tiles */}

				<Skeleton className='w-full h-2' />
			</CardFooter>
		</Card>
	);
}
