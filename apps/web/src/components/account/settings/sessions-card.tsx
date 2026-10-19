'use client';

import { startAuthentication } from '@simplewebauthn/browser';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTRPCClient } from '@/src/trpc/trpc-client';

export function SessionsCard() {
	const trpc = useTRPCClient();
	const revokeOtherSessions = useMutation({
		mutationFn: async () => {
			const options = await trpc.accounts.reauthenticate.mutate({ purpose: 'revokeOtherSessions' });
			const body = await startAuthentication({ optionsJSON: options });
			await trpc.accounts.revokeOtherSessions.mutate({ body });
		},
		onSuccess: () => {
			toast.success('Your other devices have been signed out');
		},
		onError: (error) => {
			toast.error('Unable to sign out your other devices', { description: error.message });
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Signed-in devices</CardTitle>
				<CardDescription>
					Sign out everywhere else if you have lost a device or used a shared computer. Confirm with your passkey to
					continue. You will stay signed in on this device.
				</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4'>
				<Button disabled={revokeOtherSessions.isPending} onClick={() => revokeOtherSessions.mutate()}>
					{revokeOtherSessions.isPending ? 'Confirming…' : 'Sign out other devices'}
				</Button>
			</CardFooter>
		</Card>
	);
}
