'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const formSchema = TeamSchema.pick({
	password: true,
});

type Props = {
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
};

/** Guest password auth card. */
export function PasswordLoginCard({ team }: Props) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: '',
		},
	});

	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();
	const login = trpc.guestLogin.passwordLogin.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Logging in...'));
		},
		onSuccess: () => {
			toast.success('Logged in', { id: toastId });
			router.push(`/team/${team.slug}`);
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while logging in', { id: toastId, description: error.message });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		login.mutate({
			password: values.password,
			slug: team.slug,
		});
	};

	return (
		<Card>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardHeader>
						<CardTitle>Team login</CardTitle>
						<CardDescription>
							Login to {team.displayName} with your team password to access the member attendance page.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Team password</FormLabel>
									<FormControl>
										<Input {...field} className='max-w-80' type='text' placeholder='secret123' />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className='justify-end'>
						<Button type='submit' disabled={login.isPending}>
							Log in
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
