'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { use, useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { searchParamSerializer } from '@/src/components/account/search-params';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	className?: string;
	teamInvite: Pick<TeamSchema, 'inviteCode'>;
	teamPromise: Promise<Pick<TeamSchema, 'displayName'>>;
	isAuthedPromise: Promise<boolean>;
};

export function JoinTeamButtonClient({ className, teamPromise, teamInvite, isAuthedPromise }: Props) {
	const team = use(teamPromise);
	const isAuthed = use(isAuthedPromise);
	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();

	const joinTeam = trpc.teams.forUser.join.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Joining ${team.displayName}...`));
		},
		onSuccess: (result) => {
			toast.success(`Joined ${team.displayName}`, { id: toastId });
			router.push(`/team/${result.slug}`);
			router.refresh();
		},
		onError: (error) => {
			toast.error(`An error occurred while joining ${team.displayName}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	if (isAuthed) {
		return (
			<Button className={className} onClick={() => joinTeam.mutate(teamInvite)} disabled={joinTeam.isPending}>
				Join {team.displayName}
			</Button>
		);
	}

	// No account, send them to signup page with the invite code attached
	return (
		<Link
			href={`/signup${searchParamSerializer({ invite: teamInvite.inviteCode })}`}
			className={clsx(buttonVariants(), className)}
		>
			Join {team.displayName}
		</Link>
	);
}
