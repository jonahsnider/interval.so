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
import { trpcServer } from '@/src/trpc/trpc-server';
import { UserCircleIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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
	const [{ user }, guestTeam] = await Promise.all([
		trpcServer.user.getSelf.query(),
		trpcServer.guestLogin.getCurrentGuestTeam.query(),
	]);

	if (user) {
		return <MenuContentAuthed user={user} />;
	}

	if (guestTeam) {
		const displayNamePromise = trpcServer.teams.settings.getDisplayName.query(guestTeam);

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
