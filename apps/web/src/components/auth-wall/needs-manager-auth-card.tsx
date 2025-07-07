import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
	wantedTeam: Pick<TeamSchema, 'slug' | 'displayName'>;
};

export function NeedsManagerAuthCard({ wantedTeam }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>Not signed in</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					You must be signed in to access {wantedTeam.displayName}.
				</CardDescription>
			</CardContent>

			<CardFooter className='justify-end gap-2'>
				{/* Sign up button doesn't get a view transition :( */}
				<Button asChild={true} variant='secondary'>
					<Link href='/signup'>Sign up</Link>
				</Button>
				<Button asChild={true} className='[view-transition-name:auth-card-button]'>
					<Link href='/login'>
						<span className='[view-transition-name:auth-card-button-inner]'>Login</span>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
