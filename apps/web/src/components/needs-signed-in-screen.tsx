import { trpcServer } from '../trpc/trpc-server';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import clsx from 'clsx';

function NeedsSignedInCard() {
	return (
		<Card className='text-nowrap max-w-min'>
			<CardHeader>
				<CardTitle>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>You must be signed in to access this page.</CardDescription>
			</CardContent>
			<CardFooter className='justify-end'>
				<Button asChild={true}>
					<Link href='/login'>Sign in</Link>
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
