'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import clsx from 'clsx';
import { useState } from 'react';
import { DateTimePicker } from '../date-time-picker';

type Props = {
	width?: 'full' | 'auto';
};

export function EndMeetingButton({ width = 'auto' }: Props) {
	const enabled = true;
	const [date, setDate] = useState<Date | undefined>(new Date());

	const onOpenChange = (open: boolean) => {
		if (open) {
			// Reset date to now when opening the dialog
			setDate(new Date());
		}
	};

	return (
		<Tooltip open={enabled ? false : undefined}>
			<TooltipTrigger asChild={true}>
				<div
					className={clsx({
						'w-full': width === 'full',
					})}
				>
					<AlertDialog onOpenChange={onOpenChange}>
						<AlertDialogTrigger asChild={true}>
							<Button
								className={clsx({
									'w-full': width === 'full',
								})}
								variant='outline'
								disabled={!enabled}
							>
								End meeting
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent className='max-w-min'>
							<AlertDialogHeader>
								<AlertDialogTitle>End meeting</AlertDialogTitle>
								<AlertDialogDescription>
									End the meeting by signing out all members at the specified time.
								</AlertDialogDescription>

								<div>
									<DateTimePicker onSelect={setDate} value={date} />
								</div>
							</AlertDialogHeader>

							<AlertDialogFooter className='justify-between'>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction className={buttonVariants({ variant: 'destructive' })}>
									End meeting
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</TooltipTrigger>
			<TooltipContent className='bg-accent text-accent-foreground'>
				<p>No meeting is currently in progress</p>
			</TooltipContent>
		</Tooltip>
	);
}
