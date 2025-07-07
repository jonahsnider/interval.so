import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButtonInput } from '@/src/components/copy-button-input';
import { SettingsCardContentSkeleton, SettingsCardFooterSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { TeamPasswordEditForm } from './team-password-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function TeamPasswordCard({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team password</CardTitle>
				<CardDescription>
					Visitors to your team URL must enter a password in order to gain access to the sign in form.
				</CardDescription>
			</CardHeader>

			<Suspense fallback={<TeamPasswordEditFormSkeleton />}>
				<TeamPasswordEditFormFetcher team={team} />
			</Suspense>
		</Card>
	);
}

function TeamPasswordEditFormSkeleton() {
	return (
		<>
			<SettingsCardContentSkeleton />
			<SettingsCardFooterSkeleton />
		</>
	);
}

async function TeamPasswordEditFormFetcher({ team }: Props) {
	const [currentPassword, teamManager] = await Promise.all([
		trpcServer.teams.settings.getPassword.query(team),
		trpcServer.teams.forUser.getRole.query(team),
	]);

	if (teamManager.role === 'editor') {
		return (
			<CardContent>
				<CopyButtonInput className='max-w-80' value={currentPassword.password} editable={false} />
			</CardContent>
		);
	}

	return <TeamPasswordEditForm team={team} initialTeamValue={currentPassword} />;
}
