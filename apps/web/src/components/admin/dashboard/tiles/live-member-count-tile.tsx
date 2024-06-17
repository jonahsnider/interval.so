import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { type ReactNode, Suspense } from 'react';

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
		<LiveMemberCountTileBase
			value={`${current}/${max} members`}
			progressBar={<Progress value={current} max={max === 0 ? 1 : max} />}
		/>
	);
}

function LiveMemberCountTileBase({ progressBar, value }: { progressBar: ReactNode; value: ReactNode }) {
	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardDescription className='text-base'>Signed-in members</CardDescription>

					<Badge className='hover:bg-primary shadow-none uppercase'>Live</Badge>
				</div>
				<CardTitle className='text-4xl'>{value}</CardTitle>
			</CardHeader>
			{/* Height matches the height of the text in the other tiles */}
			<CardFooter className='min-h-10'>
				{/* Min height is used to align this with where text is in the other tiles */}

				{progressBar}
			</CardFooter>
		</Card>
	);
}

function LiveMemberCountTileSkeleton() {
	return (
		<LiveMemberCountTileBase
			value={<Skeleton className='w-60 h-10' />}
			progressBar={<Skeleton className='w-full h-2' />}
		/>
	);
}
