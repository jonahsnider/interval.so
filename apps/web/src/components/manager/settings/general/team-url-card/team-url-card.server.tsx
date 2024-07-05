import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButtonInput } from '@/src/components/copy-button-input';
import { SettingsCardContentSkeleton, SettingsCardFooterSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { TeamUrlCardEditForm } from './team-url-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function TeamUrlCard({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team URL</CardTitle>
				<CardDescription>
					This is your team's URL on the hours.frc.sh platform. Team members can use this URL to access your team's
					page.
				</CardDescription>
			</CardHeader>

			<Suspense fallback={<TeamUrlCardFormSkeleton />}>
				<TeamUrlCardFormFetcher team={team} />
			</Suspense>
		</Card>
	);
}

function TeamUrlCardFormSkeleton() {
	return (
		<>
			<SettingsCardContentSkeleton />
			<SettingsCardFooterSkeleton />
		</>
	);
}

async function TeamUrlCardFormFetcher({ team }: Props) {
	const teamManager = await trpcServer.teams.forUser.getRole.query(team);

	if (teamManager.role === 'editor') {
		return (
			<CardContent>
				<CopyButtonInput value={`https://hours.frc.sh/team/${team.slug}`} editable={false} />
			</CardContent>
		);
	}

	return <TeamUrlCardEditForm team={team} />;
}
