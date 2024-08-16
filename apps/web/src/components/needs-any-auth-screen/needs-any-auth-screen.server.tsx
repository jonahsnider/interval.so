import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import type { PropsWithChildren } from 'react';
import { trpcServer } from '../../trpc/trpc-server';
import { NeedsDifferentTeamAuthCard } from './needs-any-auth-screen.client';

function NeedsSignedInCard({ team }: { team: Pick<TeamSchema, 'slug' | 'displayName'> }) {
	return (
		<Card className='text-nowrap max-w-min'>
			<CardHeader>
				<CardTitle>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>You must be signed in to access {team.displayName}.</CardDescription>
			</CardContent>
			<CardFooter className='justify-end'>
				<Button asChild={true}>
					<Link href={`/team/${team.slug}/login`}>Login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

type Props = PropsWithChildren<{
	className?: string;
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
}>;

export async function NeedsAnyAuthScreen({ children, team, className }: Props) {
	const [{ user }, currentGuestTeam] = await Promise.all([
		trpcServer.user.getSelf.query(),
		trpcServer.guestLogin.getCurrentGuestTeam.query(),
	]);

	if (user || currentGuestTeam?.slug === team.slug) {
		return <>{children}</>;
	}

	return (
		<div className={clsx('w-full flex items-center justify-center flex-1', className)}>
			{currentGuestTeam ? (
				<NeedsDifferentTeamAuthCard currentTeam={currentGuestTeam} wantedTeam={team} />
			) : (
				<NeedsSignedInCard team={team} />
			)}
		</div>
	);
}
