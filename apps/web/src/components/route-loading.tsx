import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BaseNavbar } from './navbar/base-navbar';
import { PageHeader } from './page-header';
import { MainContent } from './page-wrappers/main-content';

function NavbarLoading({ manager = false }: { manager?: boolean }) {
	return (
		<BaseNavbar
			className={manager ? 'pb-0' : undefined}
			left={<Skeleton className='ml-4 h-5 w-32' />}
			right={<Skeleton className='h-9 w-9 rounded-full' />}
			bottom={
				manager ? (
					<div className='flex gap-6 pt-2'>
						{Array.from({ length: 4 }, (_, index) => (
							<div className='border-b-2 border-transparent pb-2' key={index}>
								<Skeleton className='h-6 w-20' />
							</div>
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

export function DashboardContentLoading() {
	return (
		<div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8'>
			{Array.from({ length: 2 }, (_, index) => (
				<Card key={index}>
					<CardHeader className='gap-2'>
						<Skeleton className='h-5 w-32' />
						<Skeleton className='h-4 w-48 max-w-full' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-9 w-28' />
					</CardContent>
				</Card>
			))}
			<Card className='col-span-full'>
				<CardHeader className='grid grid-cols-2 gap-0 border-b p-0'>
					{Array.from({ length: 2 }, (_, index) => (
						<div className='flex flex-col gap-2 border-r p-4' key={index}>
							<Skeleton className='h-4 w-20' />
							<Skeleton className='h-9 w-24' />
						</div>
					))}
				</CardHeader>
				<CardContent className='pt-6'>
					<Skeleton className='h-96 w-full' />
				</CardContent>
			</Card>
		</div>
	);
}

export function AttendanceTableLoading() {
	return (
		<Card className='w-full md:max-w-xl'>
			<CardHeader>
				<Skeleton className='h-5 w-28' />
			</CardHeader>
			<CardContent className='flex gap-2'>
				<Skeleton className='h-9 flex-1' />
				<Skeleton className='h-9 w-24' />
			</CardContent>
			<CardContent className='flex flex-col gap-4'>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton className='h-5 w-full' key={index} />
				))}
			</CardContent>
		</Card>
	);
}

export function AttendancePageLoading() {
	return (
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				<AttendanceTableLoading />
			</div>
		</div>
	);
}

export function AttendanceContentLoading() {
	return (
		<MainContent>
			<AttendancePageLoading />
		</MainContent>
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
			<PageHeader title={<Skeleton className='h-[30px] w-56 sm:h-9' />}>
				<DashboardActionsLoading />
			</PageHeader>
			<MainContent>
				<DashboardContentLoading />
			</MainContent>
		</>
	);
}

export function DashboardActionsLoading() {
	return (
		<div className='flex gap-4 sm:gap-8'>
			<Skeleton className='h-9 w-28' />
			<Skeleton className='h-9 w-32' />
		</div>
	);
}

export function AttendanceRouteLoading() {
	return (
		<>
			<NavbarLoading />
			<AttendanceContentLoading />
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
