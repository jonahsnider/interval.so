import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { RouteContentLoading } from '@/src/components/route-loading';

export default function ViewMemberPageLoading() {
	return (
		<>
			<PageHeader
				className='flex-row justify-between'
				title={
					<div className='flex flex-col items-start gap-2'>
						<Skeleton className='h-[46px] w-56 sm:h-[52px]' />
						<Skeleton className='h-9 w-20' />
					</div>
				}
			>
				<Skeleton className='h-9 w-9' />
			</PageHeader>
			<MainContent className='gap-4'>
				<RouteContentLoading />
			</MainContent>
		</>
	);
}
