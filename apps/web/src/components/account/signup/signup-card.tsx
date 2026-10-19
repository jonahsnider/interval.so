'use client';

import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';
import { useRouter } from 'next/navigation';
import { useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/src/trpc/trpc-client';
import { authClient } from '@/src/auth-client';
import { searchParamParsers } from '../search-params';

const formSchema = UserSchema.pick({ displayName: true });

export function SignupCard() {
	const trpc = useTRPC();
	const [searchParams] = useQueryStates(searchParamParsers);
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: '',
		},
	});

	const joinTeam = useMutation(
		trpc.teams.forUser.join.mutationOptions({
			onMutate: () => {},
			onSuccess: (result) => {
				router.push(`/team/${result.slug}`);
				router.refresh();
			},
			onError: (error) => {
				toast.error('Your account was created, but something went wrong while joining the team', {
					description: error.message,
				});
			},
		}),
	);

	const [isPending, setIsPending] = useState(false);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsPending(true);
		try {
			const { error } = await authClient.passkey.addPasskey({ context: values.displayName, createSession: true });
			if (error) throw new Error(error.message ?? 'Unable to register that passkey.');
			if (searchParams.invite) {
				joinTeam.mutate({ inviteCode: searchParams.invite });
			} else {
				router.push('/');
			}
			router.refresh();
			toast.success('Your account was created');
		} catch (error) {
			toast.error('Unable to create your account', {
				description: error instanceof Error ? error.message : String(error),
			});
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card className='[view-transition-name:auth-card] max-w-xl'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardHeader>
						<CardTitle className='[view-transition-name:auth-card-title]'>Sign up</CardTitle>
						<CardDescription className='[view-transition-name:auth-card-description]'>
							{searchParams.invite && 'Finish registering to join the rest of your team and start tracking attendance.'}
							{!searchParams.invite && "Create or join a team to track attendance once you've registered."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name='displayName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display name</FormLabel>
									<FormControl>
										<Input {...field} className='max-w-60' type='text' autoComplete='name' />
									</FormControl>
									<div>
										<FormDescription>
											Please enter your full name, or a display name you are comfortable with.
										</FormDescription>
										<FormDescription>Don't worry, you can change this later!</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>

					<CardFooter className='justify-end'>
						<Button
							type='submit'
							disabled={isPending}
							size='lg'
							className='w-full [view-transition-name:auth-card-button]'
						>
							{isPending && <ArrowPathIcon className='h-4 w-4 animate-spin' />}
							{!isPending && <span className='[view-transition-name:auth-card-button-inner]'>Sign up</span>}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
