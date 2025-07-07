'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';
import { Link } from 'next-view-transitions';
import { Suspense, use } from 'react';
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogOut } from '@/src/hooks/log-out';

export function MenuContentAuthed({ user }: { user: Pick<UserSchema, 'displayName'> }) {
	const logOut = useLogOut({ redirectTo: '/' });

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
				<DropdownMenuItem disabled={logOut.isPending} onClick={logOut.logOut}>
					Log out
				</DropdownMenuItem>
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
}: {
	displayNamePromise: Promise<TeamSchema['displayName']>;
}) {
	const logOut = useLogOut({ redirectTo: '/' });

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>
				<Suspense fallback={<Skeleton className='h-6 w-32' />}>
					<DisplayName displayNamePromise={displayNamePromise} />
				</Suspense>
			</DropdownMenuLabel>

			<DropdownMenuSeparator />

			<DropdownMenuItem disabled={logOut.isPending} onClick={logOut.logOut}>
				Log out
			</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}
