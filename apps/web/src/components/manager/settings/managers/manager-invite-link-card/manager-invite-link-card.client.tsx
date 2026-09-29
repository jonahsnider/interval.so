'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/src/trpc/trpc-client';
import { inviteLinkUrl } from './shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialDataPromise: Promise<Pick<TeamSchema, 'inviteCode'>>;
};

export function ManageInviteLinkCardButton({ team }: Pick<Props, 'team'>) {
	const trpc = useTRPC();
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const resetInviteCode = useMutation(
		trpc.teams.settings.resetInviteCode.mutationOptions({
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
		}),
	);

	return (
		<Button variant='outline' disabled={resetInviteCode.isPending} onClick={() => resetInviteCode.mutate(team)}>
			Reset invite link
		</Button>
	);
}
