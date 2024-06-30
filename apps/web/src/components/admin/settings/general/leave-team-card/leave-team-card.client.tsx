'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function LeaveTeamCardActionAllowed({ team }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const leaveTeam = trpc.teams.leave.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Leaving team...'));
		},
		onSuccess: () => {
			toast.success('You have been removed from the team', { id: toastId });
			router.push('/');
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while leaving the team', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild={true}>
				<Button variant='outline'>Leave</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Leave team</AlertDialogTitle>
					<AlertDialogDescription>
						Revoke your access to this team. You will no longer be able to access this team's attendance page.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className={buttonVariants({ variant: 'destructive' })}
						onClick={() => leaveTeam.mutate(team)}
						disabled={leaveTeam.isPending}
					>
						Leave
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
