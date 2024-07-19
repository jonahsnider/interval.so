import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense, use } from 'react';
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
		<Card>
			<CardHeader>
				<Skeleton className='h-4 w-72' />
			</CardHeader>

			<CardContent>
				<Skeleton className='h-9 w-80' />
			</CardContent>
		</Card>
	);
}

function TeamCardsInner({
	teamsPromise,
}: {
	teamsPromise: Promise<Pick<TeamSchema, 'displayName' | 'slug'>[]>;
}) {
	const teams = use(teamsPromise);

	return (
		<>
			{teams.map((team) => (
				<TeamCard key={team.slug} team={team} />
			))}
		</>
	);
}
