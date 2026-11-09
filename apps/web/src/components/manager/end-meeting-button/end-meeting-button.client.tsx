'use client';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
	type MeetingStartHandle,
	type MembersHandle,
	useLiveMembers,
	useLiveMeetingStart,
} from '@/src/trpc/live-queries';
import { EndMeetingAlert, EndMeetingAlertTrigger } from '../end-meeting-alert';

type Props = {
	width?: 'full' | 'auto';
	membersHandle: MembersHandle;
	meetingStartHandle: MeetingStartHandle;
};

export function EndMeetingButtonClient({ width = 'auto', membersHandle, meetingStartHandle }: Props) {
	const { data: members } = useLiveMembers(membersHandle);
	const enabled = members?.some((member) => member.signedInAt);
	const { data: meeting } = useLiveMeetingStart(meetingStartHandle);

	return (
		<EndMeetingAlert team={membersHandle.input} meetingStart={meeting?.startedAt}>
			<Tooltip>
				<TooltipTrigger asChild={true}>
					{/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- This is interactive */}
					<span tabIndex={0} className={clsx({ 'w-full': width === 'full' })}>
						<EndMeetingAlertTrigger>
							<Button className='w-full' variant='outline' disabled={!enabled}>
								<ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />
								End meeting
							</Button>
						</EndMeetingAlertTrigger>
					</span>
				</TooltipTrigger>
				{!enabled && (
					<TooltipContent>
						<p>No meeting is currently in progress</p>
					</TooltipContent>
				)}
			</Tooltip>
		</EndMeetingAlert>
	);
}
