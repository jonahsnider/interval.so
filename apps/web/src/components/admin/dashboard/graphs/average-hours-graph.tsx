import { Skeleton } from '@/components/ui/skeleton';

export function AverageHoursGraph() {
	// 'Average duration members spend at meetings they sign in for'
	return (
		<div className='h-96 flex items-center justify-center'>
			<Skeleton className='h-full w-full flex items-center justify-center'>
				Average duration members spend at meetings they sign in for graph
			</Skeleton>
		</div>
	);
}
