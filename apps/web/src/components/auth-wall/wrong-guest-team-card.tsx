'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';

type Props = {
	currentTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
};

export function WrongGuestTeamCard({ currentTeam, wantedTeam }: Props) {
	const logOut = useLogOut();

	return (
		<Card className='max-w-2xl'>
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
