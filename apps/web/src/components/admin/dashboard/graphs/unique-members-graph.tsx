import { Skeleton } from '@/components/ui/skeleton';

export function UniqueMembersGraph() {
	// 'Unique members that have been to a meeting'
	return (
		<div className='h-96 flex items-center justify-center'>
			<Skeleton className='h-full w-full flex items-center justify-center'>
				Unique members that have been to a meeting graph
			</Skeleton>
		</div>
	);
}
