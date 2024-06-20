'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { use } from 'react';
import { EndMeetingAlert, EndMeetingAlertTrigger } from '../end-meeting-alert';

type Props = {
	width?: 'full' | 'auto';
	enabledPromise: Promise<boolean>;
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButtonClient({ width = 'auto', team, enabledPromise }: Props) {
	const enabled = use(enabledPromise);

	return (
		<EndMeetingAlert team={team}>
			<Tooltip>
				<TooltipTrigger asChild={true}>
					<EndMeetingAlertTrigger>
						{/* biome-ignore lint/a11y/noNoninteractiveTabindex: This is interactive */}
						<span tabIndex={0} className={clsx({ 'w-full': width === 'full' })}>
							<Button className='w-full' variant='outline' disabled={!enabled}>
								End meeting
							</Button>
						</span>
					</EndMeetingAlertTrigger>
				</TooltipTrigger>
				{!enabled && (
					<TooltipContent className='bg-accent text-accent-foreground'>
						<p>No meeting is currently in progress</p>
					</TooltipContent>
				)}
			</Tooltip>
		</EndMeetingAlert>
	);
}
