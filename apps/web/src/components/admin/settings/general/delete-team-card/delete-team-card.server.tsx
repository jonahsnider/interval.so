import { SettingsCardSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { DeleteTeamCardClient } from './delete-team-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function DeleteTeamCard({ team }: Props) {
	return (
		<Suspense fallback={<SettingsCardSkeleton />}>
			<TeamCardFetcher team={team} />
		</Suspense>
	);
}

async function TeamCardFetcher({ team }: Props) {
	const role = await trpcServer.teams.roleForSelf.query({ slug: team.slug });

	if (role.role === 'owner') {
		return <DeleteTeamCardClient team={team} />;
	}

	return undefined;
}
