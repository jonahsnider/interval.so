import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense, use } from 'react';
import { SlashSeparatedNavbarItem } from './slash-separated-navbar-item';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function GuestTeamNavbarItem() {
	const teamPromise = trpcServer.guestLogin.getCurrentGuestTeam.query();

	return (
		<ErrorBoundary fallback={<span />}>
			<Suspense>
				<GuestTeamNavbarItemInner teamPromise={teamPromise} />
			</Suspense>
		</ErrorBoundary>
	);
}

function GuestTeamNavbarItemInner({
	teamPromise,
}: {
	teamPromise: Promise<Pick<TeamSchema, 'slug'> | undefined>;
}) {
	const team = use(teamPromise);

	if (!team) {
		return undefined;
	}

	return (
		<SlashSeparatedNavbarItem
			team={{
				slug: team.slug,
				displayName: (
					<ErrorBoundary fallback={<>Failed to load</>}>
						<Suspense fallback={<Skeleton className='h-6 w-32' />}>
							<DisplayName team={team} />
						</Suspense>
					</ErrorBoundary>
				),
			}}
		/>
	);
}

async function DisplayName({ team }: Props) {
	const displayName = await trpcServer.teams.settings.getDisplayName.query(team);

	return displayName;
}
