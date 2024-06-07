import { trpcServer } from '@/src/trpc/trpc-server';
import type { PropsWithChildren } from 'react';
import { Navbar } from '../../navbar/navbar';
import { TeamDropdown } from './team-dropdown';

type Props = PropsWithChildren<{
	className?: string;
}>;

export async function TeamPageNavbar({ className, children }: Props) {
	const { user } = await trpcServer.user.getSelf.query();

	return (
		<Navbar
			className={className}
			left={
				user && (
					<div className='flex justify-start items-center'>
						<TeamDropdown />
					</div>
				)
			}
		>
			{children}
		</Navbar>
	);
}
