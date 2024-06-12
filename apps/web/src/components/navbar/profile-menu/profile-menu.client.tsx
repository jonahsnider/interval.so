'use client';

import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { UserSchema } from '@hours.frc.sh/api/app/user/schemas/user_schema';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function MenuContentAuthed({ user }: { user: Pick<UserSchema, 'displayName'> }) {
	const currentTeamSlug = 'team581';
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
					<Link href={`/team/${currentTeamSlug}/admin`}>Admin dashboard</Link>
				</DropdownMenuItem>
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

export function MenuContentGuestAuth({ team }: { team: Pick<TeamSchema, 'displayName'> }) {
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
			<DropdownMenuLabel>{team.displayName}</DropdownMenuLabel>

			<DropdownMenuSeparator />

			<DropdownMenuItem onClick={() => signOut.mutate()}>Log out</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}
