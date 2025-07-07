'use client';

import { CalendarIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { type ComponentProps, type ReactNode, useState } from 'react';
import type { SelectRangeEventHandler } from 'react-day-picker';
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
import { DurationSlug, durationLabel } from './duration-slug';

type Props = {
	start?: Date;
	end?: Date;
	className?: string;
	emptyText?: ReactNode;
	prefix?: ReactNode;
	disabled?: boolean;
	align?: ComponentProps<typeof DropdownMenuContent>['align'];

	setDatesAndClearDuration: SelectRangeEventHandler;
} & (
	| {
			duration: DurationSlug;
			setDurationAndClearDates: (value: DurationSlug) => void;
			optional?: false;
	  }
	| {
			duration?: DurationSlug;
			setDurationAndClearDates: (value?: DurationSlug) => void;
			optional: true;
	  }
);
export function PeriodSelect({
	duration,
	setDatesAndClearDuration,
	setDurationAndClearDates,
	start,
	end,
	className,
	optional,
	emptyText = 'No dates selected',
	disabled = false,
	align,
}: Props) {
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
					disabled={disabled}
					className={clsx(
						{
							'border-destructive':
								!optional &&
								duration === DurationSlug.Custom &&
								((isOpen && !start && !end) || !(isOpen || (start && end))),
						},
						className,
					)}
				>
					<CalendarIcon className='h-4 w-4 mr-2' />
					{duration === DurationSlug.Custom && start && end && (
						<>
							{start?.toLocaleDateString()} to {end?.toLocaleDateString()}
						</>
					)}

					{duration && duration !== DurationSlug.Custom && durationLabel(duration)}

					{(!duration || (duration === DurationSlug.Custom && !(start && end))) && emptyText}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align={align}>
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
					{optional && (start || end || duration) && (
						<>
							<DropdownMenuSeparator />

							<DropdownMenuItem onClick={() => setDurationAndClearDates(undefined)}>Clear</DropdownMenuItem>
						</>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
