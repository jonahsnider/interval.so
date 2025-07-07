'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CopyButtonInput } from '@/src/components/copy-button-input';
import { ReadonlyTextField } from '@/src/components/readonly-text-field';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

const formSchema = TeamSchema.pick({ slug: true });

export function TeamUrlCardEditForm({ team }: Props) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			slug: team.slug,
		},
	});
	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();
	const setSlug = trpc.teams.settings.setSlug.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating team URL...'));
		},
		onSuccess: () => {
			toast.success('Team URL was updated', { id: toastId });
			router.push(`/team/${form.getValues().slug}/dashboard/settings`);
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while updating the team URL', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setSlug.mutate({
			team,
			data: values,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent>
					<FormField
						control={form.control}
						name='slug'
						render={({ field }) => (
							<FormItem {...field}>
								<div className='flex'>
									<ReadonlyTextField className='rounded-r-none'>
										<span className='hidden sm:block'>https://</span>interval.so/team/
									</ReadonlyTextField>
									<CopyButtonInput
										className='max-w-80'
										innerClassName='rounded-l-none border-l-0'
										copyValue={`https://interval.so/team/${field.value}`}
										{...field}
									/>
								</div>

								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button type='submit' disabled={setSlug.isPending}>
						Save
					</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
