'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';

export function NotGuestOrManagerOfTeamCard({
	user,
	wantedTeam,
}: {
	user: Pick<TeamSchema, 'displayName'>;
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
}) {
	const logOut = useLogOut();

	return (
		<Card className='text-nowrap max-w-min'>
			<CardHeader>
				<CardTitle>No access to {wantedTeam.displayName}</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					You are signed in as {user.displayName}, but you are not a manager of {wantedTeam.displayName}. Try signing
					into a different account if you have one, use the guest password to login, or ask to have your account invited
					to {wantedTeam.displayName}.
				</CardDescription>
			</CardContent>
			<CardFooter className='justify-end'>
				<Button disabled={logOut.isPending} onClick={logOut.logOut}>
					Log out
				</Button>
			</CardFooter>
		</Card>
	);
}
