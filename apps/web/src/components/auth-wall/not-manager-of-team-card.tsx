'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';

export function NotManagerOfTeamCard({
	user,
	wantedTeam,
}: {
	user: Pick<UserSchema, 'displayName'>;
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
}) {
	const logOut = useLogOut();

	return (
		<Card className='max-w-2xl'>
			<CardHeader>
				<CardTitle>Missing access to {wantedTeam.displayName}</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription>
					You are signed in as {user.displayName}, but you are not a manager of {wantedTeam.displayName}. Try signing
					into a different account if you have one, or ask to be invited to {wantedTeam.displayName}.
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
