import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsCardButtonSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { LeaveTeamCardActionAllowed } from './leave-team-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function LeaveTeamCard({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Leave team</CardTitle>
				<CardDescription>Revoke your access to this team.</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4'>
				<Suspense fallback={<SettingsCardButtonSkeleton />}>
					<LeaveTeamCardAction team={team} />
				</Suspense>
			</CardFooter>
		</Card>
	);
}

async function LeaveTeamCardAction({ team }: Props) {
	const role = await trpcServer.teams.forUser.getRole.query({ slug: team.slug });

	if (role.role === 'owner') {
		return <LeaveTeamCardNotAllowed />;
	}

	return <LeaveTeamCardActionAllowed team={team} />;
}

function LeaveTeamCardNotAllowed() {
	return <CardDescription>To leave this team, someone else must have the "Owner" role.</CardDescription>;
}
