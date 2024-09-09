'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/16/solid';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const MotionSunIcon = motion.create(SunIcon);
const MotionMoonIcon = motion.create(MoonIcon);
const MotionComputerDesktopIcon = motion.create(ComputerDesktopIcon);

function ThemeIcon({ theme }: { theme: string | undefined }) {
	return (
		<div className='relative h-4 w-4'>
			<AnimatePresence initial={false} mode='popLayout'>
				{theme === 'light' && (
					<MotionSunIcon
						key='light'
						className='h-4 w-4 absolute'
						variants={motionVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
					/>
				)}
				{theme === 'dark' && (
					<MotionMoonIcon
						key='dark'
						className='h-4 w-4 absolute'
						variants={motionVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
					/>
				)}
				{theme !== 'light' && theme !== 'dark' && (
					<MotionComputerDesktopIcon
						key='system'
						className='h-4 w-4 absolute'
						variants={motionVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

const motionVariants: Variants = {
	hidden: {
		translateY: ['0', '-100%'],
		opacity: 0,
		transition: { duration: 0.15 },
	},
	visible: {
		translateY: ['100%', '0%'],
		opacity: 1,
		transition: { duration: 0.15 },
	},
};

export function ThemeSelect() {
	const { setTheme, theme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		// Placeholder
		return (
			<Button size='icon' variant='outline' disabled={true}>
				<Skeleton className='h-4 w-4' />
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button size='icon' variant='outline'>
					<ThemeIcon theme={theme} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')} role='checkbox'>
						Light
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')} role='checkbox'>
						Dark
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={theme === 'system'} onClick={() => setTheme('system')} role='checkbox'>
						System
					</DropdownMenuCheckboxItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
