'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
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
		<Card className='text-nowrap max-w-min'>
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
