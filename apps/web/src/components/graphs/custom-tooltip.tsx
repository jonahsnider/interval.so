import { DatumPeriod } from '@interval.so/api/app/team_stats/schemas/datum_time_range_schema';
import type { ReactNode } from 'react';
import { Card, CardTitle } from '@/components/ui/card';

export function formatTooltipDate(date: Date, period: DatumPeriod): string {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {};

	if (period === DatumPeriod.Monthly) {
		options.month = 'long';
		options.year = 'numeric';
	} else {
		options.day = 'numeric';
		options.weekday = 'short';
		options.month = 'short';

		if (now.getFullYear() !== date.getFullYear()) {
			options.year = 'numeric';
		}
	}

	return new Intl.DateTimeFormat(undefined, options).format(date);
}

type Props = {
	color: string | undefined;
	title: ReactNode;
	value: ReactNode;
	footer?: ReactNode;
};

export function CustomTooltip({ color, footer, title, value }: Props) {
	return (
		<Card className='px-2 py-1 flex flex-col items-center text-base'>
			<div className='flex items-center gap-6 justify-between'>
				<div className='flex gap-2 items-center'>
					<div className='h-3 w-3 rounded-full' style={{ backgroundColor: color }} />
					<CardTitle>{title}</CardTitle>
				</div>

				<p className='font-bold bg-muted rounded px-1 py-px'>{value}</p>
			</div>

			{footer && <p className='text-muted-foreground text-sm'>{footer}</p>}
		</Card>
	);
}
