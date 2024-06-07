import { Button } from '@/components/ui/button';
import { Link } from 'next-view-transitions';

export function NotFoundPageContent() {
	return (
		<div className='flex flex-1 justify-center items-center flex-col gap-8'>
			<h1 className='text-5xl font-bold'>404</h1>

			<p className='text-muted-foreground'>
				You are logged in as <strong>USERNAME</strong>
			</p>

			<Button asChild={true}>
				<Link href='/login'>Sign in as a different user</Link>
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
