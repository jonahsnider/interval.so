'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CopyButtonInput } from '@/src/components/copy-button-input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialTeamValue: Pick<TeamSchema, 'password'>;
};

const formSchema = TeamSchema.pick({ password: true });

export function TeamPasswordEditForm({ team, initialTeamValue }: Props) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: initialTeamValue.password,
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();
	const setPassword = trpc.teams.setPassword.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating team password...'));
		},
		onSuccess: () => {
			toast.success('Your team password was updated', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while updating your team password', { id: toastId, description: error.message });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setPassword.mutate({ team, data: values });
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent>
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem {...field}>
								<CopyButtonInput className='max-w-80' {...field} />

								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button type='submit' disabled={setPassword.isPending}>
						Save
					</Button>
				</CardFooter>
			</form>
		</Form>
	);
}