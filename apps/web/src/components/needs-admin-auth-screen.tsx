import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import type { PropsWithChildren } from 'react';
import { trpcServer } from '../trpc/trpc-server';

function NeedsSignedInCard() {
	return (
		<Card className='text-nowrap max-w-min [view-transition-name:auth-card]'>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					You must be signed in to access this page.
				</CardDescription>
			</CardContent>
			<CardFooter className='justify-end gap-2'>
				{/* Sign up button doesn't get a view transition :( */}
				<Button asChild={true} variant='secondary'>
					<Link href='/signup'>Sign up</Link>
				</Button>
				<Button asChild={true} className='[view-transition-name:auth-card-button]'>
					<Link href='/login'>
						<span className='[view-transition-name:auth-card-button-inner]'>Login</span>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

type Props = PropsWithChildren<{
	className?: string;
}>;

export async function NeedsAdminAuthScreen({ children, className }: Props) {
	const { user } = await trpcServer.user.getSelf.query();

	if (user) {
		return <>{children}</>;
	}

	return (
		<div className={clsx('w-full flex items-center justify-center flex-1', className)}>
			<NeedsSignedInCard />
		</div>
	);
}
