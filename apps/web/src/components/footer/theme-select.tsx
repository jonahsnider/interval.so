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
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

function ThemeIcon({ theme }: { theme: string | undefined }) {
	switch (theme) {
		case 'light':
			return <SunIcon className='h-4 w-4' />;
		case 'dark':
			return <MoonIcon className='h-4 w-4' />;
		default:
			return <ComputerDesktopIcon className='h-4 w-4' />;
	}
}

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
