'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const formSchema = TeamSchema.pick({ displayName: true });

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialDisplayName: string;
};

export function TeamDisplayNameEditForm({ team, initialDisplayName }: Props) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: initialDisplayName,
		},
	});
	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();
	const setDisplayName = trpc.teams.settings.setDisplayName.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating team display name...'));
		},
		onSuccess: () => {
			toast.success('Team display name was updated', { id: toastId });
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while updating the team display name', {
				id: toastId,
				description: error.message,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setDisplayName.mutate({ team, data: values });
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent>
					<FormField
						control={form.control}
						name='displayName'
						render={({ field }) => (
							<FormItem>
								<FormControl {...field}>
									<Input className='max-w-80' type='text' autoComplete='off' {...field} />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button type='submit' disabled={setDisplayName.isPending}>
						Save
					</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
