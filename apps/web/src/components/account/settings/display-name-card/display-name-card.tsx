'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserSchema } from '@hours.frc.sh/api/app/user/schemas/user_schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/src/trpc/trpc-client';
import { toast } from 'sonner';
import { useState } from 'react';

const formSchema = UserSchema.pick({ displayName: true });

export function DisplayNameCard() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: '',
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();
	const setDisplayName = trpc.user.setDisplayName.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating display name'));
		},
		onSuccess: () => {
			toast.success('Your display name was updated', { id: toastId });
		},
		onError: (error) => {
			toast.error(error.message, { id: toastId });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setDisplayName.mutate(values);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card>
					<CardHeader>
						<CardTitle>Display name</CardTitle>
						<CardDescription>Please enter your full name, or a display name you are comfortable with.</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name='displayName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display name</FormLabel>
									<FormControl {...field}>
										<Input className='max-w-80' {...field} />
									</FormControl>
									<FormDescription>Enter a name (ex. your first or full name) for your account.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className='border-t px-6 py-4'>
						<Button disabled={setDisplayName.isPending}>Save</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
