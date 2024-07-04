import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import clsx from 'clsx';

type Props = {
	className?: string;
};

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

export function SettingsCardContentSkeleton({ className }: Props) {
	return (
		<CardContent>
			<Skeleton className={cn(clsx('h-9 w-80', className))} />
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
