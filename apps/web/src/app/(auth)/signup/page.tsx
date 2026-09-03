import { ArrowRightIcon } from '@heroicons/react/16/solid';
import { connection } from 'next/server';
import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { AlreadyAuthedCard } from '@/src/components/account/already-authed-card/already-authed-card';
import { SignupCard } from '@/src/components/account/signup/signup-card';
import { trpcServer } from '@/src/trpc/trpc-server';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SignupPage() {
	await connection();

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
