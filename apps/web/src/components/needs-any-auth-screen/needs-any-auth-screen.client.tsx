'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { UserSchema } from '@interval.so/api/app/user/schemas/user_schema';
import { useLogOut } from '../../hooks/log-out';

export function NeedsDifferentTeamAuthCard({
	currentTeam,
	wantedTeam,
}: {
	currentTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
	wantedTeam: Pick<TeamSchema, 'displayName'>;
}) {
	const logOut = useLogOut();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Already signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					You are already signed in to {currentTeam.displayName}, sign out if you want to switch to{' '}
					{wantedTeam.displayName}.
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

export function NotManagerOfTeamCard({
	user,
	team,
}: {
	user: Pick<UserSchema, 'displayName'>;
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
}) {
	const logOut = useLogOut();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Missing access to {team.displayName}</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription>
					You are signed in as {user.displayName}, but you are not a manager of {team.displayName}. Try signing into a
					different account if you have one, or ask to be invited to {team.displayName}.
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
