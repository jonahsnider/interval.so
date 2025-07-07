import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function NeedsGuestOrManagerCard({ team }: { team: Pick<TeamSchema, 'slug' | 'displayName'> }) {
	return (
		<Card className='text-nowrap max-w-min'>
			<CardHeader>
				<CardTitle>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>You must be signed in to access {team.displayName}.</CardDescription>
			</CardContent>
			<CardFooter className='justify-end'>
				<Button asChild={true}>
					<Link href={`/team/${team.slug}/login`}>Login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
