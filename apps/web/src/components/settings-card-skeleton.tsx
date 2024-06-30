import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-5 w-32' />

				<Skeleton className='h-4 w-[32rem]' />
			</CardHeader>
			<SettingsCardContentSkeleton />
			<SettingsCardFooterSkeleton />
		</Card>
	);
}

export function SettingsCardContentSkeleton() {
	return (
		<CardContent>
			<Skeleton className='h-9 w-80' />
		</CardContent>
	);
}

export function SettingsCardFooterSkeleton() {
	return (
		<CardFooter className='border-t px-6 py-4'>
			<SettingsCardButtonSkeleton />
		</CardFooter>
	);
}

export function SettingsCardButtonSkeleton() {
	return <Skeleton className='h-9 w-32' />;
}
