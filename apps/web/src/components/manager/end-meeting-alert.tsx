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
import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DateTimePicker } from '../date-time-picker';

type Props = PropsWithChildren<{
	team: Pick<TeamSchema, 'slug'>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	meetingStart: Date | undefined;
}>;

// TODO: Refactor to use a regular dialog and not an alert

export function EndMeetingAlert({ team, open, onOpenChange, children, meetingStart }: Props) {
	const [date, setDate] = useState<Date | undefined>(new Date());

	const onOpenChangeCombined = (open: boolean) => {
		if (open) {
			// Reset date to now when opening the dialog
			setDate(new Date());
		}

		onOpenChange?.(open);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChangeCombined}>
			{children}
			<EndMeetingAlertContent setDate={setDate} team={team} date={date} meetingStart={meetingStart} />
		</AlertDialog>
	);
}

export function EndMeetingAlertTrigger({ children }: PropsWithChildren) {
	return <AlertDialogTrigger asChild={true}>{children}</AlertDialogTrigger>;
}

function EndMeetingAlertContent({
	setDate,
	team,
	date,
	meetingStart,
}: {
	date?: Date;
	setDate: (date: Date | undefined) => void;
	team: Pick<TeamSchema, 'slug'>;
	meetingStart: Date | undefined;
}) {
	return (
		<AlertDialogContent className='max-w-min'>
			<AlertDialogHeader>
				<AlertDialogTitle>End meeting</AlertDialogTitle>
				<AlertDialogDescription>
					End the meeting by signing out all members at the specified time.
				</AlertDialogDescription>

				<div>
					<DateTimePicker onSelect={setDate} value={date} fromDate={meetingStart} />
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
			toast.success('Meeting ended', { id: toastId });
			router.refresh();
		},
		onError: (error) => {
			toast.error('An error occurred while ending the meeting', {
				description: error.message,
				id: toastId,
			});
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
