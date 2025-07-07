import { PlusIcon } from '@heroicons/react/24/solid';
import { Link } from 'next-view-transitions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CreateTeamCard() {
	return (
		<Link href='/team' className='group'>
			<Card className='group-hover:bg-accent transition-all h-full'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle>Create team</CardTitle>
						<PlusIcon className='h-6 w-6 text-muted-foreground group-hover:rotate-90 transition-transform duration-300' />
					</div>
					<CardDescription>Create a new team to track meeting attendance.</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);
}
