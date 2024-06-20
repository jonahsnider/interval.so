import { Button } from '@/components/ui/button';
import { AlreadyAuthedCard } from '@/src/components/account/already-authed-card/already-authed-card';
import { LoginCard } from '@/src/components/account/login/login-card';
import { trpcServer } from '@/src/trpc/trpc-server';
import { ArrowRightIcon } from '@heroicons/react/16/solid';
import { Link } from 'next-view-transitions';
import { unstable_noStore as noStore } from 'next/cache';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function LoginPage() {
	noStore();
	const { user } = await trpcServer.user.getSelf.query();

	return (
		<div className='flex flex-1 justify-center items-center flex-col'>
			<div className='flex flex-col gap-1'>
				{user && <AlreadyAuthedCard title='Login' />}
				{!user && (
					<>
						<LoginCard />

						<div className='flex justify-start'>
							<Button asChild={true} variant='link'>
								<Link href='/signup' className='flex items-center gap-2'>
									Don't have an account? Sign up <ArrowRightIcon className='h-4 w-4' />
								</Link>
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
