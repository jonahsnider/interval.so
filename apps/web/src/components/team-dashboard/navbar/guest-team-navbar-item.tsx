import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { SlashSeparatedNavbarItem } from './slash-separated-navbar-item';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

async function DisplayName({ team }: Props) {
	const displayName = await trpcServer.teams.settings.getDisplayName.query(team);

	return displayName;
}

export function GuestTeamNavbarItem({ team }: Props) {
	return (
		<SlashSeparatedNavbarItem
			team={{
				slug: team.slug,
				displayName: (
					<Suspense fallback={<Skeleton className='h-6 w-32' />}>
						<DisplayName team={team} />
					</Suspense>
				),
			}}
		/>
	);
}
