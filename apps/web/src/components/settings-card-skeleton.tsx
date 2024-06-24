import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-5 w-32' />

				<Skeleton className='h-4 w-[32rem]' />
			</CardHeader>
			<CardContent>
				<Skeleton className='h-9 w-96' />
			</CardContent>
			<CardFooter className='border-t px-6 py-4'>
				<Skeleton className='h-9 w-32' />
			</CardFooter>
		</Card>
	);
}
