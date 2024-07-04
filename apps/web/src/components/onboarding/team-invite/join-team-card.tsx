import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { JoinTeamButton } from './join-team-button/join-team-button.server';

type Props = {
	team: Pick<TeamSchema, 'inviteCode'>;
};

export function JoinTeamCard({ team }: Props) {
	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<Suspense fallback={<JoinTeamCardHeaderSkeleton />}>
					<JoinTeamCardHeader team={team} />
				</Suspense>
			</CardHeader>

			<CardFooter className='justify-center'>
				<JoinTeamButton team={team} />
			</CardFooter>
		</Card>
	);
}

function JoinTeamCardHeaderSkeleton() {
	return (
		<>
			<CardTitle>
				<Skeleton className='h-4 w-72' />
			</CardTitle>
			<CardDescription>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-36' />
			</CardDescription>
		</>
	);
}

async function JoinTeamCardHeader({ team }: Props) {
	const dbTeam = await trpcServer.teams.getByInviteCode.query(team);

	return (
		<>
			<CardTitle>{dbTeam.owner.displayName} invited you to join them on hours.frc.sh</CardTitle>
			<CardDescription>
				Start tracking meeting hours with {dbTeam.owner.displayName} and the rest of {dbTeam.team.displayName} below.
			</CardDescription>
		</>
	);
}
