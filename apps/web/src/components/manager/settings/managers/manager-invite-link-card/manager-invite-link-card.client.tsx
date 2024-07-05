'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { inviteLinkUrl } from './shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialDataPromise: Promise<Pick<TeamSchema, 'inviteCode'>>;
};

export function ManageInviteLinkCardButton({ team }: Pick<Props, 'team'>) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const resetInviteCode = trpc.teams.settings.resetInviteCode.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Resetting invite link...'));
		},
		onSuccess: (updatedTeam) => {
			toast.success('Team invite link was reset', {
				id: toastId,
				action: { label: 'Copy', onClick: () => navigator.clipboard.writeText(inviteLinkUrl(updatedTeam)) },
			});
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while resetting the invite link', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<Button variant='outline' disabled={resetInviteCode.isPending} onClick={() => resetInviteCode.mutate(team)}>
			Reset invite link
		</Button>
	);
}
