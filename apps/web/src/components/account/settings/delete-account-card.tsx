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
import { isTrpcClientError } from '@/src/trpc/common';
import { trpc } from '@/src/trpc/trpc-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeleteAccountCard() {
	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();

	const deleteAccount = trpc.user.deleteSelf.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Deleting your account...'));
		},
		onSuccess: () => {
			toast.success('Your account was deleted', { id: toastId });
			router.push('/');
		},
		onError: (error) => {
			if (isTrpcClientError(error) && error.data?.code === 'FORBIDDEN') {
				toast.error('An error occurred while deleting your account', {
					description:
						"If you are the owner of a team, you can't delete your account. Transfer team ownership or delete the team first.",
					id: toastId,
				});
			} else {
				toast.error('An error occurred while deleting your account', {
					description: error.message,
					id: toastId,
				});
			}
		},
	});

	return (
		<AlertDialog>
			<Card className='border-destructive-border'>
				<CardHeader>
					<CardTitle>Delete account</CardTitle>
					<CardDescription>
						Permanently delete your account and all of its contents. This action is not reversible, so please continue
						with caution.
					</CardDescription>
				</CardHeader>
				<CardFooter className='border-t px-6 py-4 bg-destructive-muted border-destructive-border'>
					<AlertDialogTrigger asChild={true}>
						<Button variant='destructive' disabled={deleteAccount.isPending}>
							Delete account
						</Button>
					</AlertDialogTrigger>
				</CardFooter>
			</Card>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete account</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your data from our
						servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className={buttonVariants({ variant: 'destructive' })}
						onClick={() => deleteAccount.mutate()}
						disabled={deleteAccount.isPending}
					>
						Delete account
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
