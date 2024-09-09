'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { useState } from 'react';
import { ReadonlyTextField } from './readonly-text-field';

type Props = {
	value: string;
	copyValue?: string;
	className?: string;
	innerClassName?: string;
} & (
	| {
			onChange?: undefined;
			editable: false;
	  }
	| {
			onChange: (value: string) => void;
			editable?: true;
	  }
);

/** An input with a copy button. */
export function CopyButtonInput({
	value,
	copyValue = value,
	editable = true,
	onChange,
	className,
	innerClassName,
}: Props) {
	// z-index 1 so that the ring when focused isn't covered up by the copy button border
	const sharedStyles = clsx('rounded-r-none border-r-0 focus-visible:z-[1]', innerClassName);

	return (
		<div className={clsx('flex shadow-sm rounded-md w-full', className)}>
			{editable && <Input className={sharedStyles} value={value} onChange={(e) => onChange?.(e.target.value)} />}
			{!editable && <ReadonlyTextField className={sharedStyles}>{value}</ReadonlyTextField>}

			<CopyButton value={copyValue} />
		</div>
	);
}

// Checkmark is "dropped" in and "pushed" out
const motionVariants: Variants = {
	flyIn: { opacity: 0, scale: 0 },
	flyOut: { opacity: 0, scale: 2 },
	visible: { opacity: 1, scale: 1 },
};

const MotionClipboardIcon = motion.create(ClipboardIcon);
const MotionCheckIcon = motion.create(CheckIcon);

function CopyButton({ value }: { value: string }) {
	const [isCopied, setIsCopied] = useState(false);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();

	const onClick = () => {
		navigator.clipboard.writeText(value);
		setIsCopied(true);
		clearTimeout(timeoutId);

		setTimeoutId(
			setTimeout(() => {
				setIsCopied(false);
			}, 2000),
		);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild={true}>
				<Button
					size='icon'
					variant='outline'
					className='rounded-l-none border-l-0 shadow-none border-input-border'
					type='button'
					onClick={onClick}
				>
					<AnimatePresence initial={false} mode='popLayout'>
						{isCopied && (
							<MotionCheckIcon
								variants={motionVariants}
								initial='flyOut'
								animate='visible'
								exit='flyOut'
								className='h-4 w-4'
							/>
						)}
						{!isCopied && (
							<MotionClipboardIcon
								variants={motionVariants}
								initial='flyIn'
								animate='visible'
								exit='flyIn'
								className='h-4 w-4'
							/>
						)}
					</AnimatePresence>
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Copy</p>
			</TooltipContent>
		</Tooltip>
	);
}
