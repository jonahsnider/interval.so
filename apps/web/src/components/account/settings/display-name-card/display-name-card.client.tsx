'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const formSchema = UserSchema.pick({ displayName: true });

type Props = {
	userPromise: Promise<Pick<UserSchema, 'displayName'>>;
};

export function DisplayNameCardInner({ userPromise }: Props) {
	const user = use(userPromise);

	const initial = user.displayName;

	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: initial,
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();
	const setDisplayName = trpc.user.setDisplayName.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating display name'));
		},
		onSuccess: () => {
			toast.success('Your display name was updated', { id: toastId });
			// Refresh the router to update the RSC menu dropdown
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while updating your display name', { id: toastId, description: error.message });
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
									<FormControl>
										<Input className='max-w-80' type='text' autoComplete='name' {...field} />
									</FormControl>

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
