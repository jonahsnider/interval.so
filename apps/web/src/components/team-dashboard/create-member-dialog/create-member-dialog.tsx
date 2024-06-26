'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	closeDialog: () => void;
};

const formSchema = TeamMemberSchema.pick({ name: true });

export function CreateMemberDialog({ team, closeDialog }: Props) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
		},
	});
	const router = useRouter();

	const [toastId, setToastId] = useState<string | number | undefined>();

	const mutation = trpc.teams.members.create.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Creating account...'));
		},
		onSuccess: () => {
			closeDialog();
			router.refresh();
			toast.success('A new account was created', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while creating the account', { id: toastId, description: error.message });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		mutation.mutate({
			team,
			member: values,
		});
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Sign up</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl {...field}>
									<Input className='max-w-80' type='text' autoComplete='off' {...field} placeholder='Your name' />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type='submit' disabled={mutation.isPending}>
							Submit
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</>
	);
}
