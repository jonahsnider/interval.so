import { UserCircleIcon } from '@heroicons/react/20/solid';
import { connection } from 'next/server';
import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthState, getTeamDisplayName } from '@/src/trpc/trpc-server';
import { MenuContentAuthed, MenuContentGuestAuth } from './profile-menu.client';

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
					Sign up
				</Link>
			</DropdownMenuItem>
		</>
	);
}

async function ProfileMenuContent() {
	await connection();

	const { user, guestTeam } = await getAuthState();

	if (user) {
		return <MenuContentAuthed user={user} />;
	}

	if (guestTeam) {
		const displayNamePromise = getTeamDisplayName(guestTeam.slug);

		return <MenuContentGuestAuth displayNamePromise={displayNamePromise} />;
	}

	return <MenuContentUnauthed />;
}

function ProfileMenuContentSkeleton() {
	return (
		<>
			<DropdownMenuLabel>
				<Skeleton className='h-4' />
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem disabled={true} className='data-[disabled]:opacity-100'>
				<Skeleton className='h-4 w-full' />
			</DropdownMenuItem>
			<DropdownMenuItem disabled={true} className='data-[disabled]:opacity-100'>
				<Skeleton className='h-4 w-full' />
			</DropdownMenuItem>
		</>
	);
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
				<ErrorBoundary
					fallback={<DropdownMenuLabel>Something went wrong while loading your profile</DropdownMenuLabel>}
				>
					<Suspense fallback={<ProfileMenuContentSkeleton />}>
						<ProfileMenuContent />
					</Suspense>
				</ErrorBoundary>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
