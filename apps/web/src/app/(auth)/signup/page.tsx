import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlreadyAuthedCard } from '@/src/components/account/already-authed-card/already-authed-card';

import { SignupCard } from '@/src/components/account/signup/signup-card';
import { signupsEnabledFlag } from '@/src/flags';
import { trpcServer } from '@/src/trpc/trpc-server';
import { ArrowRightIcon } from '@heroicons/react/16/solid';
import { Link } from 'next-view-transitions';
import { unstable_noStore as noStore } from 'next/cache';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function SignupPage() {
	noStore();

	const signupsEnabled = await signupsEnabledFlag();

	if (!signupsEnabled) {
		return (
			<div className='flex items-center justify-center flex-1'>
				<Card>
					<CardHeader>
						<CardTitle>Sign up</CardTitle>
					</CardHeader>

					<CardContent>
						<CardDescription>Sign ups for Interval will be available soon</CardDescription>
					</CardContent>
				</Card>
			</div>
		);
	}

	const { user } = await trpcServer.user.getSelf.query();

	return (
		<div className='flex items-center justify-center flex-1'>
			<div className='flex flex-col gap-1'>
				{user && <AlreadyAuthedCard title='Sign up' />}
				{!user && (
					<>
						<SignupCard />

						<div className='flex justify-start'>
							<Button asChild={true} variant='link'>
								<Link href='/login' className='flex items-center gap-2'>
									Have an account? Login <ArrowRightIcon className='h-4 w-4' />
								</Link>
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
