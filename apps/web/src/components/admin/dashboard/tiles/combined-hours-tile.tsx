'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import clsx from 'clsx';
import { useContext } from 'react';
import { durationLabelPreviousPeriod } from '../../period-select';
import { AdminDashboardContext } from '../admin-dashboard-context';

export function CombinedHoursTile() {
	const { duration } = useContext(AdminDashboardContext);

	const label = durationLabelPreviousPeriod(duration);

	return (
		<Card>
			<CardHeader className='pb-2'>
				<CardDescription className='text-base'>Combined hours</CardDescription>
				<CardTitle className='text-4xl'>432 hours</CardTitle>
			</CardHeader>
			<CardFooter
				className={clsx('text-xs text-muted-foreground', {
					invisible: !label,
				})}
			>
				+25% from {label?.toLowerCase()}
			</CardFooter>
		</Card>
	);
}
