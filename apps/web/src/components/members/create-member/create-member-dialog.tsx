'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const formSchema = TeamMemberSchema.pick({ name: true });

function CreateMemberDialogContent({
	team,
	closeDialog,
	open,
}: {
	team: Pick<TeamSchema, 'slug'>;
	closeDialog: () => void;
	open: boolean;
}) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
		},
	});
	const [toastId, setToastId] = useState<string | number | undefined>();

	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const mutation = trpc.teams.members.create.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Creating member...'));
		},
		onSuccess: () => {
			closeDialog();
			toast.success('A new member was created', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while creating the member', { id: toastId, description: error.message });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		mutation.mutate({
			team,
			member: values,
		});
	};

	return (
		<DialogContent>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
					<DialogHeader>
						<DialogTitle>Create member</DialogTitle>
					</DialogHeader>
					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl {...field}>
									<Input className='max-w-80' type='text' autoComplete='off' {...field} placeholder='Member name' />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<DialogFooter>
						<Button type='submit' disabled={mutation.isPending}>
							Sign up
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}

type Props = PropsWithChildren<
	{
		team: Pick<TeamSchema, 'slug'>;
	} & ButtonProps
>;

export function CreateMemberDialog({ team, children, ...buttonProps }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild={true}>
				<Button variant='outline' disabled={open} {...buttonProps}>
					{children}
				</Button>
			</DialogTrigger>
			<CreateMemberDialogContent team={team} closeDialog={() => setOpen(false)} open={open} />
		</Dialog>
	);
}
