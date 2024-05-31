import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircleIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';

function MenuContentUnauthed() {
	return (
		<>
			<DropdownMenuLabel>Account</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild={true}>
				<Link href='/login' className='cursor-pointer'>
					Login
				</Link>
			</DropdownMenuItem>
			<DropdownMenuItem asChild={true}>
				<Link href='/signup' className='cursor-pointer'>
					Sign Up
				</Link>
			</DropdownMenuItem>
		</>
	);
}

function MenuContentAuthed() {
	const userName = 'Jonah Snider';
	const currentTeamSlug = 'team581';

	return (
		<>
			<DropdownMenuLabel>{userName}</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild={true}>
				<Link href={`/team/${currentTeamSlug}/admin`}>Admin dashboard</Link>
			</DropdownMenuItem>
			<DropdownMenuItem asChild={true}>
				<Link href='/account'>Account settings</Link>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem>Logout</DropdownMenuItem>
		</>
	);
}

export function ProfileMenu() {
	const user = true;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button variant='secondary' size='icon' className='rounded-full'>
					<UserCircleIcon className='w-5 h-5' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>{user ? <MenuContentAuthed /> : <MenuContentUnauthed />}</DropdownMenuContent>
		</DropdownMenu>
	);
}
