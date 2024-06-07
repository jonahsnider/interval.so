import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import clsx from 'clsx';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { trpcServer } from '../trpc/trpc-server';

function NeedsSignedInCard() {
	return (
		<Card className='text-nowrap max-w-min'>
			<CardHeader>
				<CardTitle>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>You must be signed in to access this page.</CardDescription>
			</CardContent>
			<CardFooter className='justify-end gap-2'>
				<Button asChild={true} variant='secondary'>
					<Link href='/signup'>Sign up</Link>
				</Button>
				<Button asChild={true}>
					<Link href='/login'>Login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

type Props = PropsWithChildren<{
	className?: string;
}>;

export async function NeedsSignedInScreen({ children, className }: Props) {
	const { user } = await trpcServer.user.getSelf.query();

	if (user) {
		return <>{children}</>;
	}

	return (
		<div className={clsx('w-full flex items-center justify-center', className)}>
			<NeedsSignedInCard />
		</div>
	);
}
