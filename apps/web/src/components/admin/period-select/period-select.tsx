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
import { useState } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug, durationLabel } from './duration-slug';

type Props = {
	duration: DurationSlug;
	start?: Date;
	end?: Date;

	setDurationAndClearDates: (value: DurationSlug) => void;
	setDatesAndClearDuration: SelectRangeEventHandler;
};
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
