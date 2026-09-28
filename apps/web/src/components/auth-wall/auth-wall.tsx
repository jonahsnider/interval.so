import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { type PropsWithChildren, Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthState, getIsAuthed, getTeamDisplayName } from '@/src/trpc/trpc-server';
import { MainContent } from '../page-wrappers/main-content';
import { NeedsGuestOrManagerCard } from './needs-guest-or-manager-card';
import { NeedsManagerAuthCard } from './needs-manager-auth-card';
import { NeedsManagerNotGuestCard } from './needs-manager-not-guest-card';
import { NeedsUserAuthCard } from './needs-user-auth-card';
import { NotGuestOrManagerOfTeamCard } from './not-guest-or-manager-card';
import { NotManagerOfTeamCard } from './not-manager-of-team-card';
import { WrongGuestTeamCard } from './wrong-guest-team-card';

type Props = PropsWithChildren<
	{
		className?: string;
		authStatePromise?: ReturnType<typeof getAuthState>;
	} & (
		| {
				/** The session is authed as a guest for the given team, or a user with manager access to the team. */
				kind: 'guestOrManager';
				wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'> | Pick<TeamSchema, 'slug'>;
		  }
		| {
				/** The user is authed as a manager for the given team. */
				kind: 'manager';
				wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'> | Pick<TeamSchema, 'slug'>;
		  }
		| {
				/** The user is authed as a non-guest account, not used for team-specific access control. */
				kind: 'user';
				wantedTeam?: undefined;
		  }
	)
>;

/**
 * Render its children if the user is signed in and if provided, has access to the given team.
 */
export function AuthWall({ authStatePromise, kind, children, wantedTeam }: Props) {
	let content: React.ReactNode;

	switch (kind) {
		case 'guestOrManager':
			content = (
				<AuthWallGuestOrManager authStatePromise={authStatePromise} wantedTeam={wantedTeam}>
					{children}
				</AuthWallGuestOrManager>
			);
			break;
		case 'manager':
			content = (
				<AuthWallManager authStatePromise={authStatePromise} wantedTeam={wantedTeam}>
					{children}
				</AuthWallManager>
			);
			break;
		case 'user':
			content = <AuthWallUser>{children}</AuthWallUser>;
	}

	return <Suspense fallback={<AuthWallFallback />}>{content}</Suspense>;
}

function AuthWallFallback() {
	return (
		<div className='flex flex-1 items-center justify-center'>
			<Card className='w-full max-w-xl'>
				<CardHeader className='gap-2'>
					<Skeleton className='h-6 w-40' />
					<Skeleton className='h-4 w-full' />
				</CardHeader>
				<CardContent>
					<Skeleton className='h-9 w-full' />
				</CardContent>
			</Card>
		</div>
	);
}

type CardProps = PropsWithChildren<{ className?: string }>;

function AuthCardWrapper({ children, className }: CardProps) {
	return <MainContent className={clsx('items-center justify-center max-w-2xl', className)}>{children}</MainContent>;
}

async function teamWithDisplayName(
	team: Pick<TeamSchema, 'slug' | 'displayName'> | Pick<TeamSchema, 'slug'>,
): Promise<Pick<TeamSchema, 'slug' | 'displayName'>> {
	if ('displayName' in team) {
		return team;
	}

	return {
		slug: team.slug,
		displayName: await getTeamDisplayName(team.slug),
	};
}

async function AuthWallUser({ children }: CardProps) {
	const isAuthed = await getIsAuthed();

	if (!isAuthed) {
		return (
			<AuthCardWrapper>
				<NeedsUserAuthCard />
			</AuthCardWrapper>
		);
	}

	return <>{children}</>;
}

async function AuthWallManager({
	authStatePromise,
	wantedTeam,
	children,
}: CardProps & {
	authStatePromise?: ReturnType<typeof getAuthState>;
	wantedTeam: Pick<TeamSchema, 'slug'> | Pick<TeamSchema, 'slug' | 'displayName'>;
}) {
	const { user, guestTeam } = await (authStatePromise ?? getAuthState());

	if (guestTeam) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<NeedsManagerNotGuestCard wantedTeam={fullTeam} />
			</AuthCardWrapper>
		);
	}

	if (!user) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<NeedsManagerAuthCard wantedTeam={fullTeam} />
			</AuthCardWrapper>
		);
	}

	if (!Object.hasOwn(user.teams, wantedTeam.slug)) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<NotManagerOfTeamCard user={user} wantedTeam={fullTeam} />
			</AuthCardWrapper>
		);
	}

	return <>{children}</>;
}

async function AuthWallGuestOrManager({
	authStatePromise,
	wantedTeam,
	children,
}: CardProps & {
	authStatePromise?: ReturnType<typeof getAuthState>;
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'> | Pick<TeamSchema, 'slug'>;
}) {
	const { user, guestTeam } = await (authStatePromise ?? getAuthState());

	// Guest auth present, but for the wrong team
	if (guestTeam && guestTeam.slug !== wantedTeam.slug) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<WrongGuestTeamCard currentTeam={guestTeam} wantedTeam={fullTeam} />
			</AuthCardWrapper>
		);
	}

	// User is signed in but not a manager of the wanted team
	if (user && !Object.hasOwn(user.teams, wantedTeam.slug)) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<NotGuestOrManagerOfTeamCard user={user} wantedTeam={fullTeam} />
			</AuthCardWrapper>
		);
	}

	// Not authed at all
	if (!(guestTeam || user)) {
		const fullTeam = await teamWithDisplayName(wantedTeam);

		return (
			<AuthCardWrapper>
				<NeedsGuestOrManagerCard team={fullTeam} />
			</AuthCardWrapper>
		);
	}

	return <>{children}</>;
}
