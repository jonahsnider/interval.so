'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateTimeRangePicker } from '@/src/components/date-time-range-picker';
import { trpc } from '@/src/trpc/trpc-client';
import { PlusIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	className?: string;
};

const formSchema = z.object({
	timeRange: TimeRangeSchema,
});

export function AddAttendanceButton({ className, member }: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			timeRange: {
				start: undefined,
				end: undefined,
			},
		},
	});

	const [toastId, setToastId] = useState<string | number | undefined>();
	const createMeeting = trpc.teams.members.attendance.createEntry.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Adding attendance entry...'));
		},
		onSuccess: () => {
			toast.success('Attendance entry added', { id: toastId });
			setOpen(false);
		},
		onError: (error) => {
			toast.error('An error occurred while adding the attendance entry', {
				description: error.message,
				id: toastId,
			});
		},
	});

	const [open, setOpenRaw] = useState(false);

	const setOpen = (open: boolean) => {
		setOpenRaw(open);

		if (!open) {
			form.reset();
		}
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		createMeeting.mutate({
			member,
			data: {
				startedAt: values.timeRange.start,
				endedAt: values.timeRange.end,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild={true}>
				<Button className={className}>
					<PlusIcon className='h-4 w-4 mr-2' />
					Add attendance
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add attendance</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
						<FormField
							control={form.control}
							name='timeRange'
							render={({ field }) => (
								<FormItem className='flex flex-col'>
									<FormLabel>Sign in & sign out time</FormLabel>
									<FormControl>
										<DateTimeRangePicker
											value={field.value}
											onSelect={field.onChange}
											display='range'
											className='max-w-min'
										/>
									</FormControl>

									{/* Display the error messages for the subfields, since <FormField /> can't handle it by default. */}
									<FormField control={form.control} name='timeRange.start' render={() => <FormMessage />} />
									<FormField control={form.control} name='timeRange.end' render={() => <FormMessage />} />
								</FormItem>
							)}
						/>

						<DialogFooter>
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
