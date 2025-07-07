import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LiveMemberCountTileBase({ progressBar, value }: { progressBar: ReactNode; value: ReactNode }) {
	return (
		<Card>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardDescription className='text-base'>Signed-in members</CardDescription>

					<Badge className='hover:bg-primary shadow-none uppercase'>Live</Badge>
				</div>
				<CardTitle className='text-4xl'>{value}</CardTitle>
			</CardHeader>
			{/* Height matches the height of the text in the other tiles */}
			<CardFooter className='min-h-10'>
				{/* Min height is used to align this with where text is in the other tiles */}

				{progressBar}
			</CardFooter>
		</Card>
	);
}
