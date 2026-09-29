import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsCardSkeleton } from '@/src/components/settings-card-skeleton';

export function AccountSettingsLoading() {
	return (
		<div className='flex max-w-3xl flex-col gap-4'>
			<SettingsCardSkeleton />

			<Card className='border-destructive-border'>
				<CardHeader>
					<Skeleton className='h-5 w-32' />
					<Skeleton className='h-20 w-full sm:h-10' />
				</CardHeader>
				<CardFooter className='border-t border-destructive-border bg-destructive-muted px-6 py-4'>
					<Skeleton className='h-9 w-32' />
				</CardFooter>
			</Card>
		</div>
	);
}
