import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function LiveMemberCountTile() {
	const current = 24;
	const max = 34;

	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardDescription className='text-base'>Signed-in members</CardDescription>

					<Badge className='hover:bg-primary shadow-none uppercase'>Live</Badge>
				</div>
				<CardTitle className='text-4xl'>
					{current}/{max} members
				</CardTitle>
			</CardHeader>
			{/* Height matches the height of the text in the other tiles */}
			<CardFooter className='min-h-10'>
				{/* Min height is used to align this with where text is in the other tiles */}

				<Progress value={current} max={max} />
			</CardFooter>
		</Card>
	);
}
