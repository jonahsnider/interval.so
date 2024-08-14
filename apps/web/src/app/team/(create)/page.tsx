'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CreateTeamNameCard } from '@/src/components/create-team/form/create-team-name-card';
import { CreateTeamPasswordCard } from '@/src/components/create-team/form/create-team-password';
import { CreateTeamUrlCard } from '@/src/components/create-team/form/create-team-url-card';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const formSchema = TeamSchema.pick({ displayName: true, password: true, slug: true });

export type CreateTeamFormType = UseFormReturn<z.infer<typeof formSchema>, unknown, undefined>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function CreateTeamPage() {
	const router = useRouter();
	const form: CreateTeamFormType = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: '',
			password: '',
			slug: '',
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();

	const createTeam = trpc.teams.create.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Creating team'));
		},
		onSuccess: () => {
			toast.success('Your team was created', { id: toastId });
			router.push('/');
			router.refresh();
		},
		onError: (error) => {
			toast.error('Failed to create team', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		createTeam.mutate(values);
	};

	return (
		<div className='items-center flex justify-center'>
			<Form {...form}>
				<form className='flex flex-col gap-4 max-w-4xl' onSubmit={form.handleSubmit(onSubmit)}>
					<CreateTeamNameCard form={form} />
					<CreateTeamUrlCard form={form} />
					<CreateTeamPasswordCard form={form} />
					<Button className='max-w-min mx-auto' size='lg' type='submit' disabled={createTeam.isPending}>
						Create team
					</Button>
				</form>
			</Form>
		</div>
	);
}
