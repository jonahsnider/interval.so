'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDownIcon, ArrowUpIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import type { Column } from '@tanstack/react-table';
import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

const motionVariants: Variants = {
	hidden: {
		translateY: ['0', '-100%'],
		transition: { duration: 0.15 },
		opacity: 0,
	},
	visible: {
		translateY: ['100%', '0%'],
		transition: { duration: 0.15 },
		opacity: 1,
	},
};

const MotionArrowUpIcon = motion(ArrowUpIcon);
const MotionArrowDownIcon = motion(ArrowDownIcon);
const MotionChevronUpDownIcon = motion(ChevronUpDownIcon);

// biome-ignore lint/suspicious/noExplicitAny: This is in a generic type
type Props<T extends Column<any, any>> = PropsWithChildren<{
	column: T;
	side?: 'left' | 'right';
}>;

// biome-ignore lint/suspicious/noExplicitAny: This is in a generic type
export function SortableHeader<T extends Column<any, any>>({ column, children, side = 'left' }: Props<T>) {
	return (
		<div className={clsx({ 'text-right': side === 'right' })}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild={true}>
					<Button
						variant='ghost'
						size='sm'
						className={clsx('text-sm', {
							'-ml-3': side === 'left',
						})}
					>
						{children}

						<AnimatePresence initial={false} mode='wait'>
							{column.getIsSorted() === 'asc' && (
								<MotionArrowUpIcon
									key='up'
									variants={motionVariants}
									initial='hidden'
									animate='visible'
									exit='hidden'
									className='ml-2 h-4 w-4'
								/>
							)}
							{column.getIsSorted() === 'desc' && (
								<MotionArrowDownIcon
									key='desc'
									variants={motionVariants}
									initial='hidden'
									animate='visible'
									exit='hidden'
									className='ml-2 h-4 w-4'
								/>
							)}
							{column.getIsSorted() === false && (
								<MotionChevronUpDownIcon
									key='chevron'
									variants={motionVariants}
									initial='hidden'
									animate='visible'
									exit='hidden'
									className='ml-2 h-4 w-4'
								/>
							)}
						</AnimatePresence>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem className='flex items-center gap-2' onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className='h-4 w-4 text-muted-foreground' />
						Ascending
					</DropdownMenuItem>
					<DropdownMenuItem className='flex items-center gap-2' onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className='h-4 w-4 text-muted-foreground' />
						Descending
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
