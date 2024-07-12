'use client';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { trpc } from '@/src/trpc/trpc-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { type PropsWithChildren, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type Props = PropsWithChildren<{
	member: Pick<TeamMemberSchema, 'id' | 'name'>;
}>;

const formSchema = TeamMemberSchema.pick({ name: true });

export function EditMemberNameDialog({ member, children }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: member.name,
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();

	const editName = trpc.teams.members.setName.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Updating member name...'));
		},
		onSuccess: () => {
			toast.success('Member name was updated', { id: toastId });
			setOpen(false);
		},
		onError: (error) => {
			toast.error('An error occurred while updating the member name', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		editName.mutate({ id: member.id, name: values.name });
	};

	const [open, setOpen] = useState(false);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild={true}>{children}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit member name</AlertDialogTitle>
				</AlertDialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input className='max-w-80' type='text' autoComplete='off' {...field} />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
						<AlertDialogFooter className='sm:justify-between'>
							<AlertDialogCancel>Cancel</AlertDialogCancel>

							<Button type='submit'>Save</Button>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
