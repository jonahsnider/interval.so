import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense, use } from 'react';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { CreateTeamCard } from './create-team-card';
import { TeamCard } from './team-card/team-card.server';

export function TeamCards() {
	const teamsPromise = trpcServer.teams.forUser.getTeamNames.query();

	return (
		<div className='grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 w-full md:max-w-4xl'>
			<Suspense
				fallback={
					<>
						<TeamCardSkeleton />
						<TeamCardSkeleton />
						<TeamCardSkeleton />
						<TeamCardSkeleton />
					</>
				}
			>
				<TeamCardsInner teamsPromise={teamsPromise} />
				<CreateTeamCard />
			</Suspense>
		</div>
	);
}

function TeamCardSkeleton() {
	return (
		<Card className='justify-between flex-col flex'>
			<CardHeader>
				<Skeleton className='h-4 w-40 max-w-full' />
				<Skeleton className='h-4 w-full' />
			</CardHeader>

			<CardFooter>
				<Skeleton className='h-10 w-36 max-w-full' />
			</CardFooter>
		</Card>
	);
}

function TeamCardsInner({ teamsPromise }: { teamsPromise: Promise<Pick<TeamSchema, 'displayName' | 'slug'>[]> }) {
	const teams = use(teamsPromise);

	return (
		<>
			{teams.map((team) => (
				<TeamCard key={team.slug} team={team} />
			))}
		</>
	);
}
