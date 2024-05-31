import type { PropsWithChildren } from 'react';
import { Navbar } from '../../navbar/navbar';
import { TeamDropdown } from './team-dropdown';

type Props = PropsWithChildren<{
	className?: string;
}>;

export function TeamPageNavbar({ className, children }: Props) {
	return (
		<Navbar
			className={className}
			left={
				<div className='flex justify-start items-center'>
					<TeamDropdown />
				</div>
			}
		>
			{children}
		</Navbar>
	);
}
