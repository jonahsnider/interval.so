'use client';

import { useResetTrpcClient } from '@/src/providers/trpc-provider';

import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/src/auth-client';

export function LoginCard() {
	const resetTrpcClient = useResetTrpcClient();
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

	const onClick = async () => {
		setIsPending(true);
		try {
			const { data, error } = await authClient.signIn.passkey();
			if (error) throw new Error(error.message ?? 'Unable to sign in with that passkey.');
			if (!data) return;
			resetTrpcClient();
			router.push('/');
			router.refresh();
			toast.success(`Logged in as ${data.user.name}`);
		} catch (error) {
			toast.error('Unable to log in', { description: error instanceof Error ? error.message : String(error) });
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card className='[view-transition-name:auth-card]'>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>Login</CardTitle>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					Login to Interval with your passkey.
				</CardDescription>
			</CardHeader>
			<CardFooter className='justify-center'>
				<Button
					disabled={isPending}
					onClick={onClick}
					size='lg'
					className='w-full [view-transition-name:auth-card-button]'
				>
					{isPending && <ArrowPathIcon className='h-4 w-4 animate-spin' />}
					{!isPending && <span className='[view-transition-name:auth-card-button-inner]'>Login</span>}
				</Button>
			</CardFooter>
		</Card>
	);
}
