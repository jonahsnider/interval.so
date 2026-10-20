'use client';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLiveMembers, useLiveMeetingStart } from '@/src/trpc/live-queries';
import { EndMeetingAlert, EndMeetingAlertTrigger } from '../end-meeting-alert';

type Props = {
	width?: 'full' | 'auto';
	enabledPromise: Promise<boolean>;
	meetingStartPromise: Promise<{ startedAt?: Date | undefined }>;
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButtonClient({ width = 'auto', team, enabledPromise, meetingStartPromise }: Props) {
	const initialEnabled = use(enabledPromise);
	const initialMeetingStart = use(meetingStartPromise);

	const { data: members } = useLiveMembers(team);
	const enabled = members ? members.some((member) => member.signedInAt) : initialEnabled;
	const { data: meeting } = useLiveMeetingStart(team, initialMeetingStart);

	return (
		<EndMeetingAlert team={team} meetingStart={meeting?.startedAt}>
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
