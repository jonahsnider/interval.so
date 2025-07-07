import { ArrowRightIcon } from '@heroicons/react/24/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManagerLinkTile({ team }: Props) {
	return (
		<Link href={`/team/${encodeURIComponent(team.slug)}/dashboard`} className='h-full w-full'>
			<Card className='transition-colors h-full flex xs:flex-col hover:bg-muted justify-between'>
				<CardHeader className='w-full'>
					<CardTitle>Manager dashboard</CardTitle>
					<CardDescription>View historical data, manage members, and more</CardDescription>
				</CardHeader>

				<CardHeader className='pl-0 items-center justify-center xs:hidden'>
					<ArrowRightIcon className='h-6 w-6 text-muted-foreground' />
				</CardHeader>

				<CardFooter className='justify-end items-end max-xs:hidden'>
					<ArrowRightIcon className='h-6 w-6 text-muted-foreground' />
				</CardFooter>
			</Card>
		</Link>
	);
}
