'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/src/trpc/trpc-client';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { use, useState } from 'react';
import { EndMeetingAlert, EndMeetingAlertTrigger } from '../end-meeting-alert';

type Props = {
	width?: 'full' | 'auto';
	enabledPromise: Promise<boolean>;
	meetingStartPromise: Promise<{ startedAt?: Date | undefined }>;
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButtonClient({ width = 'auto', team, enabledPromise, meetingStartPromise }: Props) {
	const initialEnabled = use(enabledPromise);
	const [enabled, setEnabled] = useState(initialEnabled);
	const initialMeetingStart = use(meetingStartPromise);
	const [meetingStart, setMeetingStart] = useState(initialMeetingStart.startedAt);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) => {
			setEnabled(data.some((member) => member.signedInAt));
		},
	});
	trpc.teams.meetings.currentMeetingStartSubscription.useSubscription(team, {
		onData: setMeetingStart,
	});

	return (
		<EndMeetingAlert team={team} meetingStart={meetingStart}>
			<Tooltip>
				<TooltipTrigger asChild={true}>
					{/* biome-ignore lint/a11y/noNoninteractiveTabindex: This is interactive */}
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
