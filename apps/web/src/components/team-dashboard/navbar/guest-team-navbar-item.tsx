import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense, use } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentGuestTeam, getTeamDisplayName } from '@/src/trpc/trpc-server';
import { SlashSeparatedNavbarItem } from './slash-separated-navbar-item';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function GuestTeamNavbarItem() {
	const teamPromise = getCurrentGuestTeam();

	return (
		<ErrorBoundary fallback={<span />}>
			<Suspense>
				<GuestTeamNavbarItemInner teamPromise={teamPromise} />
			</Suspense>
		</ErrorBoundary>
	);
}

function GuestTeamNavbarItemInner({ teamPromise }: { teamPromise: Promise<Pick<TeamSchema, 'slug'> | undefined> }) {
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
	const displayName = await getTeamDisplayName(team.slug);

	return displayName;
}
