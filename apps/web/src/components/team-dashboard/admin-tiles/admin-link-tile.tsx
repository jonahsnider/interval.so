import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function AdminLinkTile({ team }: Props) {
	return (
		<Link href={`/team/${encodeURIComponent(team.slug)}/admin`} className='h-full w-full'>
			<Card className='transition-colors relative h-full flex flex-col justify-between hover:bg-muted'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle>Admin dashboard</CardTitle>
						<ArrowRightIcon className='h-6 w-6 text-muted-foreground sm:hidden' />
					</div>
					<CardDescription>View historical data, manage members, and more</CardDescription>
				</CardHeader>

				<CardFooter className='justify-end hidden sm:flex'>
					<ArrowRightIcon className='h-6 w-6 text-muted-foreground' />
				</CardFooter>
			</Card>
		</Link>
	);
}
