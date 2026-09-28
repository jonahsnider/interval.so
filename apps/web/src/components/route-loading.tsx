import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BaseNavbar } from './navbar/base-navbar';
import { PageHeader } from './page-header';
import { MainContent } from './page-wrappers/main-content';

function NavbarLoading({ manager = false }: { manager?: boolean }) {
	return (
		<BaseNavbar
			left={<Skeleton className='ml-4 h-5 w-32' />}
			right={<Skeleton className='h-9 w-9 rounded-full' />}
			bottom={
				manager ? (
					<div className='flex gap-6 pt-4'>
						{Array.from({ length: 4 }, (_, index) => (
							<Skeleton className='h-5 w-20' key={index} />
						))}
					</div>
				) : undefined
			}
		/>
	);
}

export function RouteContentLoading() {
	return (
		<div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8'>
			{Array.from({ length: 3 }, (_, index) => (
				<Card key={index}>
					<CardHeader className='gap-2'>
						<Skeleton className='h-5 w-32' />
						<Skeleton className='h-4 w-48 max-w-full' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-20 w-full' />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function SettingsContentLoading() {
	return (
		<>
			<div className='col-span-full flex flex-col gap-2 md:col-span-1'>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
			</div>
			<div className='col-span-full flex flex-col gap-4 md:col-span-3'>
				{Array.from({ length: 3 }, (_, index) => (
					<Card key={index}>
						<CardHeader className='gap-2'>
							<Skeleton className='h-5 w-36' />
							<Skeleton className='h-4 w-full' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-9 w-full' />
						</CardContent>
					</Card>
				))}
			</div>
		</>
	);
}

export function SettingsCardsLoading() {
	return (
		<div className='flex flex-col gap-4'>
			{Array.from({ length: 3 }, (_, index) => (
				<Card key={index}>
					<CardHeader className='gap-2'>
						<Skeleton className='h-5 w-36' />
						<Skeleton className='h-4 w-full' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-9 w-full' />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function DashboardPageLoading() {
	return (
		<>
			<PageHeader title={<Skeleton className='h-9 w-56' />} />
			<MainContent>
				<RouteContentLoading />
			</MainContent>
		</>
	);
}

export function TeamRouteLoading() {
	return (
		<>
			<NavbarLoading />
			<MainContent>
				<RouteContentLoading />
			</MainContent>
		</>
	);
}

export function ManagerRouteLoading() {
	return (
		<>
			<NavbarLoading manager={true} />
			<DashboardPageLoading />
		</>
	);
}
