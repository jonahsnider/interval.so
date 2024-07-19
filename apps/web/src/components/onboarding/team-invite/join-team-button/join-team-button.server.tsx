import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Suspense } from 'react';
import { JoinTeamButtonClient } from './join-team-button.client';

type Props = {
	className?: string;
	team: Pick<TeamSchema, 'inviteCode'>;
};

export function JoinTeamButton({ className, team }: Props) {
	const teamPromise = trpcServer.teams.getByInviteCode.query(team).then(({ team }) => team);
	const isAuthedPromise = trpcServer.user.getSelf.query().then(({ user }) => Boolean(user));

	return (
		<Suspense fallback={<Skeleton className={cn(clsx('h-9 w-48', className))} />}>
			<JoinTeamButtonClient
				className={className}
				teamPromise={teamPromise}
				teamInvite={team}
				isAuthedPromise={isAuthedPromise}
			/>
		</Suspense>
	);
}
