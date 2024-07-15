'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild={true}>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit member name</DialogTitle>
				</DialogHeader>

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
						<DialogFooter className='sm:justify-between'>
							<DialogClose asChild={true}>
								<Button variant='outline'>Cancel</Button>
							</DialogClose>

							<Button type='submit'>Save</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
