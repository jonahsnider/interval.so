'use client';

import { CalendarIcon } from '@heroicons/react/16/solid';
import type { TimeRangeSchema } from '@interval.so/api/app/team_stats/schemas/time_range_schema';
import { parseDate } from 'chrono-node';
import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate, formatDateRange } from '../utils/date-format';

type Props = {
	value: Partial<TimeRangeSchema>;
	onSelect: (value: Partial<TimeRangeSchema>) => void;
	className?: string;
	picker?: Omit<CalendarProps, 'mode' | 'onSelect' | 'selected'>;
	fromDate?: Date;
	buttonProps?: ButtonProps;
	icon?: boolean;
	verbose?: boolean;
	display: 'start' | 'end' | 'range';
	disabled?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function getUsedValue(input: {
	value: Partial<TimeRangeSchema>;
	display: 'start' | 'end' | 'range';
	verbose: boolean;
}): string | undefined {
	switch (input.display) {
		case 'start':
			return input.value.start ? formatDate(input.value.start, input.verbose) : undefined;
		case 'end':
			return input.value.end ? formatDate(input.value.end, input.verbose) : undefined;
		case 'range':
			return input.value.start && input.value.end
				? formatDateRange(input.value.start, input.value.end, input.verbose)
				: undefined;
	}
}

export function DateTimeRangePicker({
	onSelect,
	value,
	className,
	picker,
	fromDate,
	buttonProps,
	icon = true,
	verbose = false,
	display,
	disabled,
	onOpenChange,
}: Props) {
	const [startInputFocused, setStartInputFocused] = useState(false);
	const [endInputFocused, setEndInputFocused] = useState(false);
	const [startInput, setStartInput] = useState(value.start ? formatDate(value.start) : '');
	const [endInput, setEndInput] = useState(value.end ? formatDate(value.end) : '');
	const now = new Date();

	useEffect(() => {
		// When value is updated externally (ex. reverting an invalid change), we trigger the calendar selection function
		// This will update the text field values to ensure their state matches what is shown on the calendar

		if (!(startInputFocused || endInputFocused)) {
			// This is a hacky way to avoid the inputs effectively ignoring any changes that can't have a date extracted from them
			onCalendarSelection(value);
		}
	}, [value, startInputFocused, endInputFocused]);

	const onCalendarSelection = (range: Partial<TimeRangeSchema>) => {
		if (range.start) {
			setStartInput(formatDate(range.start, true));
		} else {
			setStartInput('');
		}

		if (range.end) {
			setEndInput(formatDate(range.end, true));
		} else {
			setEndInput('');
		}
	};

	const onStartInput = (date: string) => {
		setStartInput(date);

		const parsed = parseDate(date, now);

		if (parsed) {
			// Prevent entering a time in the future
			onSelect({
				start: parsed,
				end: value?.end,
			});
		}
	};

	const onEndInput = (date: string) => {
		setEndInput(date);

		const parsed = parseDate(date, now);

		if (parsed) {
			// Prevent entering a time in the future
			onSelect({
				start: value?.start,
				end: parsed,
			});
		}
	};

	return (
		<Popover onOpenChange={onOpenChange}>
			<PopoverTrigger asChild={true}>
				<Button disabled={disabled} variant='outline' {...buttonProps} className={cn('min-w-64', className)}>
					{icon && <CalendarIcon className='h-4 w-4 mr-2' />}
					{getUsedValue({ display, value, verbose }) ?? 'Select dates'}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-2 px-0 max-w-min py-2'>
				<div className='px-2'>
					<Calendar
						mode='range'
						{...picker}
						selected={{
							from: value.start,
							to: value.end,
						}}
						onSelect={(date) => {
							onCalendarSelection({
								start: date?.from,
								end: date?.to,
							});
							onSelect({
								start: date?.from,
								end: date?.to,
							});
						}}
						className={cn('p-0', picker?.className)}
						fromDate={fromDate}
						toDate={now}
					/>
				</div>
				<Separator />
				<div className='px-2 flex flex-col gap-2'>
					<div className='flex flex-col gap-1'>
						<p className='text-xs text-muted-foreground'>Start</p>
						<Input
							value={startInput}
							placeholder='Try "yesterday" or "3pm"'
							onChange={(e) => onStartInput(e.target.value)}
							onFocus={() => setStartInputFocused(true)}
							onBlur={() => setStartInputFocused(false)}
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-muted-foreground'>End</p>
						<Input
							value={endInput}
							placeholder='Try "yesterday" or "3pm"'
							onChange={(e) => onEndInput(e.target.value)}
							onFocus={() => setEndInputFocused(true)}
							onBlur={() => setEndInputFocused(false)}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
