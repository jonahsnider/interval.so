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
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DateTimePicker } from '../../date-time-picker';

type Props = {
	width?: 'full' | 'auto';
	enabled: boolean;
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButtonClient({ width = 'auto', team, enabled }: Props) {
	return (
		<Tooltip>
			<TooltipTrigger asChild={true}>
				{/* biome-ignore lint/a11y/noNoninteractiveTabindex: This is interactive */}
				<span tabIndex={0} className={clsx({ 'w-full': width === 'full' })}>
					<Inner enabled={enabled} team={team} />
				</span>
			</TooltipTrigger>
			{!enabled && (
				<TooltipContent className='bg-accent text-accent-foreground'>
					<p>No meeting is currently in progress</p>
				</TooltipContent>
			)}
		</Tooltip>
	);
}

function Inner({ enabled, team }: { enabled: boolean; team: Pick<TeamSchema, 'slug'> }) {
	const [date, setDate] = useState<Date | undefined>(new Date());

	const onOpenChange = (open: boolean) => {
		if (open) {
			// Reset date to now when opening the dialog
			setDate(new Date());
		}
	};

	return (
		<AlertDialog onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild={true}>
				<Button className='w-full' variant='outline' disabled={!enabled}>
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
					<Tooltip open={date === undefined ? undefined : false}>
						<TooltipTrigger asChild={true}>
							{/* biome-ignore lint/a11y/noNoninteractiveTabindex: This is interactive */}
							<span tabIndex={0}>
								<EndMeetingDialogAction date={date} team={team} />
							</span>
						</TooltipTrigger>

						<TooltipContent className='bg-accent text-accent-foreground'>
							<p>You must select an end time</p>
						</TooltipContent>
					</Tooltip>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function EndMeetingDialogAction({
	date,
	team,
}: {
	date?: Date;
	team: Pick<TeamSchema, 'slug'>;
}) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const signOutAll = trpc.teams.members.endMeeting.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Ending meeting...'));
		},
		onSuccess: () => {
			setToastId(toast.success('Meeting ended', { id: toastId }));
		},
		onError: (error) => {
			setToastId(
				toast.error('An error occurred while ending the meeting', {
					description: error.message,
					id: toastId,
				}),
			);
		},
		onSettled: () => {
			router.refresh();
		},
	});

	const onClick = () => {
		if (!date) {
			return;
		}

		signOutAll.mutate({
			endTime: date,
			team,
		});
	};

	return (
		<AlertDialogAction
			disabled={date === undefined}
			className={clsx(buttonVariants({ variant: 'destructive' }), 'pointer-events-auto')}
			onClick={onClick}
		>
			End meeting
		</AlertDialogAction>
	);
}
