import { unstable_noStore as noStore } from 'next/cache';
import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { trpcServer } from '../trpc/trpc-server';

export async function NotFoundPageContent() {
	noStore();
	const { user } = await trpcServer.user.getSelf.query();

	return (
		<div className='flex flex-1 justify-center items-center flex-col gap-6'>
			<h1 className='text-5xl font-bold'>404</h1>

			<p className='text-muted-foreground'>
				{user && (
					<>
						You are logged in as <strong>{user.displayName}</strong>
					</>
				)}
				{!user && "You aren't logged in"}
			</p>

			<Button asChild={true} size='lg'>
				<Link href='/login' className='[view-transition-name:auth-card-button]'>
					<span className='[view-transition-name:auth-card-button-inner]'>
						{user && 'Login as a different user'}
						{!user && 'Login'}
					</span>
				</Link>
			</Button>

			<div className='text-center flex'>
				<p>
					or,{' '}
					<Link href='/' className='underline'>
						go back to the home page
					</Link>
				</p>
			</div>
		</div>
	);
}
