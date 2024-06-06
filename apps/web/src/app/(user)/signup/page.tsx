'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSchema } from '@hours.frc.sh/api/app/user/schemas/user_schema';
import { startRegistration } from '@simplewebauthn/browser';
import { revalidatePath } from 'next/cache';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

const formSchema = UserSchema.pick({ displayName: true });

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function SignupPage() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: '',
		},
	});

	const getRegistrationOptions = trpc.auth.register.generateRegistrationOptions.useMutation();
	const finishRegistration = trpc.auth.register.verifyRegistrationResponse.useMutation();

	const [isPending, setIsPending] = useState(false);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsPending(true);

		try {
			const registrationOptions = await getRegistrationOptions.mutateAsync({ displayName: values.displayName });

			const registration = await startRegistration(registrationOptions);

			await finishRegistration.mutateAsync({ user: values, body: registration });

			revalidatePath('/signup');
		} catch (error) {
			console.error(error);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className='flex items-center justify-center flex-1'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Card>
						<CardHeader>
							<CardTitle>Sign up</CardTitle>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name='displayName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Display name</FormLabel>
										<FormControl {...field}>
											<Input {...field} />
										</FormControl>
										<FormDescription>Enter a name (ex. your first or full name) for your account.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>

						<CardFooter>
							<Button type='submit' disabled={isPending}>
								Sign up
							</Button>
						</CardFooter>
					</Card>
				</form>
			</Form>
		</div>
	);
}
