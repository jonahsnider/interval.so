'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/src/trpc/trpc-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AlreadyAuthedCardInner({ displayName, title }: { displayName: string; title: string }) {
	const router = useRouter();

	const signOut = trpc.auth.logOut.useMutation({
		onSuccess: () => {
			router.refresh();
			toast.success('You have been logged out');
		},
		onError: () => {
			toast.error('An error occurred while logging you out');
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription>You're already signed in as {displayName}.</CardDescription>
			</CardContent>

			<CardFooter className='justify-end'>
				<Button disabled={signOut.isPending} onClick={() => signOut.mutate()}>
					Log out
				</Button>
			</CardFooter>
		</Card>
	);
}
