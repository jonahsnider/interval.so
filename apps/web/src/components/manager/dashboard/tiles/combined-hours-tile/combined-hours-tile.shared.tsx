import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export function CombinedHoursTileBase({ trend, value }: { trend?: ReactNode; value: ReactNode }) {
	return (
		<Card>
			<CardHeader className='pb-2'>
				<CardDescription className='text-base'>Combined hours</CardDescription>
				<CardTitle className='text-4xl'>{value}</CardTitle>
			</CardHeader>
			<CardFooter
				className={clsx('text-xs text-muted-foreground', {
					invisible: !trend,
				})}
			>
				{trend}
			</CardFooter>
		</Card>
	);
}
