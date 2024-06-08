'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { type Duration, intervalToDuration } from 'date-fns';
import { useState } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';

export enum DurationSlug {
	Last7Days = '7d',
	Last30Days = '30d',
	Last12Months = '12m',
	ThisYear = 'thisYear',
	Custom = 'custom',
}

type Props = {
	duration: DurationSlug;
	start?: Date;
	end?: Date;

	setDurationAndClearDates: (value: DurationSlug) => void;
	setDatesAndClearDuration: SelectRangeEventHandler;
};

const DURATIONS = {
	[DurationSlug.Last7Days]: 'Last 7 days',
	[DurationSlug.Last30Days]: 'Last 30 days',
	[DurationSlug.Last12Months]: 'Last 12 months',
	[DurationSlug.ThisYear]: 'This year',
	[DurationSlug.Custom]: undefined,
} as const;

export function durationLabel(duration: DurationSlug): string | undefined {
	return DURATIONS[duration];
}

export function durationLabelPreviousPeriod(duration: DurationSlug): string | undefined {
	if (duration === DurationSlug.ThisYear) {
		return 'Last year';
	}

	return durationLabel(duration);
}

export function toDateFnsDuration(duration: DurationSlug): Duration {
	switch (duration) {
		case DurationSlug.Last7Days:
			return { days: 7 };
		case DurationSlug.Last30Days:
			return { days: 30 };
		case DurationSlug.Last12Months:
			return { months: 12 };
		case DurationSlug.ThisYear: {
			// The difference between the current timestamp and the start of this year
			// Kinda hacky but this doesn't need to be high precision

			const now = new Date();
			const startOfThisYear = new Date(now.getFullYear(), 0, 1);

			return intervalToDuration({ start: startOfThisYear, end: now });
		}
		default:
			return {};
	}
}

export function PeriodSelect({ duration, setDatesAndClearDuration, setDurationAndClearDates, start, end }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	// Prevent from staying in a state where no dates are selected but you are in custom mode
	const onOpenChange = (open: boolean) => {
		if (!open && duration === DurationSlug.Custom && !start && !end) {
			setDurationAndClearDates(DurationSlug.Last7Days);
		}
		setIsOpen(open);
	};

	return (
		<DropdownMenu onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild={true}>
				<Button
					variant='outline'
					className={clsx({
						'border-destructive':
							duration === DurationSlug.Custom && ((isOpen && !start && !end) || !(isOpen || (start && end))),
					})}
				>
					<CalendarIcon className='h-4 w-4 mr-2' />
					{duration === DurationSlug.Custom &&
						(start || end ? (
							<>
								{start?.toLocaleDateString()} to {end?.toLocaleDateString()}
							</>
						) : (
							<>No dates selected</>
						))}

					{duration !== DurationSlug.Custom && durationLabel(duration)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56'>
				<DropdownMenuGroup>
					{Object.values(DurationSlug)
						.filter((duration) => duration !== DurationSlug.Custom)
						.map((durationId) => (
							<DropdownMenuItem key={durationId} onClick={() => setDurationAndClearDates(durationId as DurationSlug)}>
								{durationLabel(durationId as DurationSlug)}
							</DropdownMenuItem>
						))}
					<DropdownMenuSeparator />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Select dates</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<Calendar
									mode='range'
									toDate={new Date()}
									selected={{
										from: start ?? undefined,
										to: end ?? undefined,
									}}
									onSelect={setDatesAndClearDuration}
									numberOfMonths={2}
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
