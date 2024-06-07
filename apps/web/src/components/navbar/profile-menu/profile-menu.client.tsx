'use client';

import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function MenuContentAuthed({ displayName }: { displayName: string }) {
	const currentTeamSlug = 'team581';
	const router = useRouter();

	const signOut = trpc.auth.logOut.useMutation({
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
			<DropdownMenuLabel>{displayName}</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild={true}>
				<Link href={`/team/${currentTeamSlug}/admin`}>Admin dashboard</Link>
			</DropdownMenuItem>
			<DropdownMenuItem asChild={true}>
				<Link href='/account'>Account settings</Link>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onClick={() => signOut.mutate()}>Logout</DropdownMenuItem>
		</>
	);
}
