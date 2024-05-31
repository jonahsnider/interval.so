import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'next-view-transitions';

export function AdminLinkTile() {
	const teamSlug = 'team581';

	return (
		<Link href={`/team/${encodeURIComponent(teamSlug)}/admin`} className='h-full w-full'>
			<Card className='transition-colors relative h-full flex flex-col justify-between hover:bg-muted'>
				<CardHeader>
					<CardTitle>Admin dashboard</CardTitle>
					<CardDescription>View historical data, manage members, and more</CardDescription>
				</CardHeader>

				<CardFooter className='justify-end'>
					<ArrowRightIcon className='h-6 w-6 text-muted-foreground' />
				</CardFooter>
			</Card>
		</Link>
	);
}
