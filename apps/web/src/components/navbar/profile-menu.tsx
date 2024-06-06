import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trpcServer } from '@/src/trpc/trpc-server';
import { UserCircleIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';
import { Suspense } from 'react';

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

function MenuContentAuthed({ displayName }: { displayName: string }) {
	const currentTeamSlug = 'team581';

	return (
		<>
			<DropdownMenuLabel>{displayName}</DropdownMenuLabel>
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

async function ProfileMenuContent() {
	const { user } = await trpcServer.user.getSelf.query();

	if (user) {
		return <MenuContentAuthed displayName={user.displayName} />;
	}

	return <MenuContentUnauthed />;
}

export function ProfileMenu() {
	'use client';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button variant='secondary' size='icon' className='rounded-full'>
					<UserCircleIcon className='w-5 h-5' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<Suspense fallback={<DropdownMenuLabel>Loading...</DropdownMenuLabel>}>
					<ProfileMenuContent />
				</Suspense>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
