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
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function DeleteTeamCardClient({ team }: Props) {
	const router = useRouter();
	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteTeam = trpc.teams.delete.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting team...'));
		},
		onSuccess: () => {
			toast.success('Team deleted', { id: toastId });
			router.push('/');
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while deleting the team', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<Card className='border-destructive-border'>
			<CardHeader>
				<CardTitle>Delete team</CardTitle>
				<CardDescription>
					Permanently delete this team and all of its contents. This action is not reversible, so please continue with
					caution.
				</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4 bg-destructive-muted border-destructive-border'>
				<AlertDialog>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete team</AlertDialogTitle>
							<AlertDialogDescription>
								Permanently delete this team and all of its contents. This action is not reversible, so please continue
								with caution.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className={buttonVariants({ variant: 'destructive' })}
								onClick={() => deleteTeam.mutate(team)}
								disabled={deleteTeam.isPending}
							>
								Delete team
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>

					<AlertDialogTrigger asChild={true}>
						<Button variant='destructive'>Delete team</Button>
					</AlertDialogTrigger>
				</AlertDialog>
			</CardFooter>
		</Card>
	);
}
