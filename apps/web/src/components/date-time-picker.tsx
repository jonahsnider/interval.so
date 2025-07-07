import { CalendarIcon } from '@heroicons/react/16/solid';
import { parseDate } from 'chrono-node';
import { clamp } from 'date-fns';
import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate } from '../utils/date-format';

type Props = {
	value: Date | undefined;
	onSelect: (value: Date | undefined) => void;
	className?: string;
	picker?: Omit<CalendarProps, 'mode' | 'onSelect' | 'selected'>;
	fromDate?: Date;
	buttonProps?: ButtonProps;
	icon?: boolean;
	verbose?: boolean;
};

export function DateTimePicker({
	onSelect,
	value,
	className,
	picker,
	fromDate,
	buttonProps,
	icon = true,
	verbose = false,
}: Props) {
	const [textInput, setDateInput] = useState(value ? formatDate(value) : '');
	const now = new Date();

	const onCalendarSelection = (date?: Date) => {
		if (date) {
			setDateInput(formatDate(date, true));
		} else {
			setDateInput('');
		}
	};

	const onTextInput = (date: string) => {
		setDateInput(date);

		const parsed = parseDate(date, now);

		if (parsed) {
			// Prevent entering a time in the future
			onSelect(
				clamp(parsed, {
					start: fromDate ?? 0,
					end: now,
				}),
			);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild={true}>
				<Button variant='outline' {...buttonProps} className={cn('min-w-64', className)}>
					{icon && <CalendarIcon className='h-4 w-4 mr-2' />}
					{value ? formatDate(value, verbose) : 'Select date'}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-2 px-0 max-w-min py-2'>
				<div className='px-2'>
					<Calendar
						mode='single'
						{...picker}
						selected={value}
						onSelect={(date) => {
							onCalendarSelection(date);
							onSelect(date);
						}}
						className={cn('p-0', picker?.className)}
						fromDate={fromDate}
						toDate={now}
					/>
				</div>
				<Separator />
				<div className='px-2'>
					<Input
						value={textInput}
						placeholder='Try "yesterday" or "3pm"'
						onChange={(e) => onTextInput(e.target.value)}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
