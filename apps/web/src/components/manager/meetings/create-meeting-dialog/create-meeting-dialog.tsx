'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { trpc } from '@/src/trpc/trpc-client';
import { PlusIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { CreateTeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/create_team_meeting_schema';
import { sub } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { DateTimeRangePicker } from '../../../date-time-range-picker';
import { AttendeesSelect } from './attendees-select';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	className?: string;
};

const formSchema = CreateTeamMeetingSchema;

export function CreateMeetingDialog({ team, className }: Props) {
	const [dialogOpen, setDialogOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			timeRange: {
				start: sub(new Date(), { hours: 1 }),
				end: new Date(),
			},
			attendees: [],
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();

	const createMeeting = trpc.teams.meetings.create.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Creating meeting...'));
		},
		onSuccess: () => {
			toast.success('Meeting created', { id: toastId });
			onDialogOpenChange(false);
		},
		onError: (error) => {
			toast.error('An error occurred while creating the meeting', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		createMeeting.mutate(values);
	};

	const onDialogOpenChange = (open: boolean) => {
		setDialogOpen(open);

		if (!open) {
			form.reset();
		}
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
			<DialogTrigger asChild={true}>
				<Button className={className}>
					<PlusIcon className='h-4 w-4 mr-2' />
					Add meeting
				</Button>
			</DialogTrigger>

			<DialogContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
						<DialogHeader>
							<DialogTitle>Add meeting</DialogTitle>
						</DialogHeader>

						<FormField
							control={form.control}
							name='timeRange'
							render={({ field }) => (
								<FormItem className='flex flex-col'>
									<FormLabel>Meeting duration</FormLabel>
									<FormControl>
										<DateTimeRangePicker display='range' onSelect={field.onChange} {...field} className='max-w-min' />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='attendees'
							render={({ field }) => (
								<FormItem className='flex flex-col'>
									<FormLabel>Attendees</FormLabel>
									<FormControl>
										<AttendeesSelect team={team} {...field} className='max-w-min' />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className='justify-end'>
							<Button type='submit' disabled={createMeeting.isPending}>
								Add
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
