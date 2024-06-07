'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/src/trpc/trpc-client';
import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { WebAuthnError, startAuthentication } from '@simplewebauthn/browser';
import type { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { TRPCClientError } from '@trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoginCard() {
	const router = useRouter();

	const getLoginOptions = trpc.auth.login.generateAuthenticationOptions.useMutation();
	const finishLogin = trpc.auth.login.verifyAuthenticationResponse.useMutation({
		onSuccess: () => {
			router.push('/');
			router.refresh();
		},
	});

	const [isPending, setIsPending] = useState(false);

	const wrappedGetLoginOptions = async () => {
		try {
			return await getLoginOptions.mutateAsync();
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(`An error occurred while preparing to login: ${error.message}`);
			} else {
				toast.error(`An unknown error occurred while preparing to login: ${error}`);
			}

			throw error;
		}
	};

	const wrappedStartAuthentication = async (loginOptions: PublicKeyCredentialRequestOptionsJSON) => {
		try {
			return await startAuthentication(loginOptions);
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.name === 'NotAllowedError' ||
					(error instanceof WebAuthnError &&
						error.code === 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY' &&
						error.cause instanceof Error &&
						error.cause.name === 'NotAllowedError')
				) {
					toast.error('Login cancelled');
				} else {
					toast.error(`An error occurred while logging in: ${error.message}`);
				}
			} else {
				toast.error(`An unknown error occurred while logging in: ${error}`);
			}

			throw error;
		}
	};

	const wrappedFinishLogin = async (login: AuthenticationResponseJSON) => {
		try {
			await finishLogin.mutateAsync({ body: login });
		} catch (error) {
			if (error instanceof TRPCClientError) {
				toast.error(`An error occurred while finalizing your login: ${error.message}`);
			} else {
				toast.error(`An unknown error occurred while finalizing your login: ${error}`);
			}

			throw error;
		}
	};

	const onClick = async () => {
		setIsPending(true);

		try {
			const loginOptions = await wrappedGetLoginOptions();

			const login = await wrappedStartAuthentication(loginOptions);

			await wrappedFinishLogin(login);
		} catch {
			return;
		} finally {
			setIsPending(false);
		}

		toast.success('You were logged in');
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>Login to hours.frc.sh with your passkey.</CardDescription>
			</CardHeader>
			<CardFooter className='justify-center'>
				<Button onClick={onClick} size='lg' className='w-full'>
					{isPending && <ArrowPathIcon className='h-4 w-4 animate-spin' />}
					{!isPending && 'Login'}
				</Button>
			</CardFooter>
		</Card>
	);
}
