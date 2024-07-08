'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@heroicons/react/16/solid';
import type { TimeRangeSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_range_schema';
import { parseDate } from 'chrono-node';
import { useState } from 'react';
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
};

export function DateTimeRangePicker({
	onSelect,
	value,
	className,
	picker,
	fromDate,
	buttonProps,
	icon = true,
	verbose = false,
}: Props) {
	const [startInput, setStartInput] = useState(value.start ? formatDate(value.start) : '');
	const [endInput, setEndInput] = useState(value.end ? formatDate(value.end) : '');
	const now = new Date();

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
		<Popover>
			<PopoverTrigger asChild={true}>
				<Button variant='outline' {...buttonProps} className={cn('min-w-64', className)}>
					{icon && <CalendarIcon className='h-4 w-4 mr-2' />}
					{value.start && value.end ? formatDateRange(value.start, value.end, verbose) : 'Select dates'}
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
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-muted-foreground'>End</p>
						<Input
							value={endInput}
							placeholder='Try "yesterday" or "3pm"'
							onChange={(e) => onEndInput(e.target.value)}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
