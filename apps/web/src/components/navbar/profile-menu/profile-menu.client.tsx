'use client';

import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { Suspense, use } from 'react';
import { toast } from 'sonner';

export function MenuContentAuthed({ user }: { user: Pick<UserSchema, 'displayName'> }) {
	const router = useRouter();

	const signOut = trpc.accounts.logOut.useMutation({
		onSuccess: () => {
			router.push('/');
			router.refresh();
			toast.success('You have been logged out');
		},
		onError: () => {
			toast.error('An error occurred while logging you out');
		},
	});

	return (
		<>
			<DropdownMenuGroup>
				<DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild={true}>
					<Link href='/account'>Account settings</Link>
				</DropdownMenuItem>
			</DropdownMenuGroup>

			<DropdownMenuSeparator />

			<DropdownMenuGroup>
				<DropdownMenuItem onClick={() => signOut.mutate()}>Log out</DropdownMenuItem>
			</DropdownMenuGroup>
		</>
	);
}

function DisplayName({ displayNamePromise }: { displayNamePromise: Promise<TeamSchema['displayName']> }) {
	const displayName = use(displayNamePromise);

	return displayName;
}

export function MenuContentGuestAuth({
	displayNamePromise,
}: { displayNamePromise: Promise<TeamSchema['displayName']> }) {
	const router = useRouter();

	const signOut = trpc.accounts.logOut.useMutation({
		onSuccess: () => {
			router.push('/');
			router.refresh();
			toast.success('You have been logged out');
		},
		onError: () => {
			toast.error('An error occurred while logging you out');
		},
	});

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>
				<Suspense fallback={<Skeleton className='h-6 w-32' />}>
					<DisplayName displayNamePromise={displayNamePromise} />
				</Suspense>
			</DropdownMenuLabel>

			<DropdownMenuSeparator />

			<DropdownMenuItem onClick={() => signOut.mutate()}>Log out</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}
