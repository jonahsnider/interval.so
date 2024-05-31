'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EndMeetingButton } from '../../admin/end-meeting-button';

export function ManageTile() {
	return (
		<Card className='h-full w-full flex flex-col justify-between'>
			<CardHeader>
				<CardTitle>Manage</CardTitle>
				<CardDescription>End the meeting by signing out all members</CardDescription>
			</CardHeader>

			<CardFooter>
				<EndMeetingButton width='full' />
			</CardFooter>
		</Card>
	);
}
