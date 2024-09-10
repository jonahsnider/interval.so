'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';

type Props = {
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
};

export function NeedsManagerNotGuestCard({ wantedTeam }: Props) {
	const logOut = useLogOut();

	return (
		<Card>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>Not signed in as manager</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					You are signed in to {wantedTeam.displayName} as a guest, but you must be a manager to access this page.
				</CardDescription>
			</CardContent>

			<CardFooter className='justify-end gap-2'>
				<Button disabled={logOut.isPending} onClick={logOut.logOut}>
					Log out
				</Button>
			</CardFooter>
		</Card>
	);
}
