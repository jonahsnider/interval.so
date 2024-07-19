import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadonlyTextField } from '@/src/components/readonly-text-field';
import { SettingsCardContentSkeleton, SettingsCardFooterSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { TeamDisplayNameEditForm } from './team-display-name-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function TeamDisplayNameCard({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team display name</CardTitle>
				<CardDescription>This is your team's visible name within Interval.</CardDescription>
			</CardHeader>

			<Suspense fallback={<TeamDisplayNameEditFormSkeleton />}>
				<TeamDisplayNameEditFormFetcher team={team} />
			</Suspense>
		</Card>
	);
}

function TeamDisplayNameEditFormSkeleton() {
	return (
		<>
			<SettingsCardContentSkeleton />
			<SettingsCardFooterSkeleton />
		</>
	);
}

async function TeamDisplayNameEditFormFetcher({ team }: Props) {
	const [currentDisplayName, teamManager] = await Promise.all([
		trpcServer.teams.settings.getDisplayName.query(team),
		trpcServer.teams.forUser.getRole.query(team),
	]);

	if (teamManager.role === 'editor') {
		return (
			<CardContent>
				<ReadonlyTextField>{currentDisplayName}</ReadonlyTextField>
			</CardContent>
		);
	}

	return <TeamDisplayNameEditForm team={team} initialDisplayName={currentDisplayName} />;
}
