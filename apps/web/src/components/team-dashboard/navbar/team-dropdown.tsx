'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUpDownIcon, PlusIcon } from '@heroicons/react/16/solid';
import { SlashIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const teams = ['Pineapple', 'Banana', 'Blueberry'];
const currentTeam = teams[0];

export function TeamDropdown() {
	const router = useRouter();

	const selectTeam = useMemo(
		() => (team: string) => {
			router.push(`/team/${encodeURIComponent(team)}`);
		},
		[router],
	);

	return (
		<DropdownMenu>
			<Link href={`/team/${currentTeam}`} className='flex items-center leading-none'>
				<div className='px-2 text-muted-foreground'>
					<SlashIcon height={20} width={20} />
				</div>

				<p className='pr-2'>{currentTeam}</p>

				<DropdownMenuTrigger asChild={true}>
					<Button size='icon' variant='ghost'>
						<ChevronUpDownIcon className='w-4 h-4' />
					</Button>
				</DropdownMenuTrigger>
			</Link>
			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Your teams</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{teams.map((team) => (
					<DropdownMenuCheckboxItem key={team} checked={currentTeam === team} onCheckedChange={() => selectTeam(team)}>
						{team}
					</DropdownMenuCheckboxItem>
				))}
				<DropdownMenuSeparator />
				<Link href='/team'>
					<DropdownMenuItem>
						<PlusIcon className='w-4 h-4 mr-2' />
						Create team
					</DropdownMenuItem>
				</Link>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
