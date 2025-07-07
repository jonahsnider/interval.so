'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';

type Props = {
	team: Pick<TeamSchema, 'slug' | 'displayName'>;
};

export function AlreadyAuthedCard({ team }: Props) {
	const logOut = useLogOut();

	return (
		<Card className='[view-transition-name:auth-card]'>
			<CardHeader>
				<CardTitle>Already signed in</CardTitle>
				<CardDescription>You are already signed in to {team.displayName}.</CardDescription>
			</CardHeader>
			<CardFooter className='justify-end gap-4'>
				<Button disabled={logOut.isPending} onClick={logOut.logOut} variant='outline'>
					Log out
				</Button>
				<Button asChild={true}>
					<Link href={`/team/${team.slug}`}>Go to team</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
