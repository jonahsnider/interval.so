import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import type { PropsWithChildren } from 'react';
import { ProfileMenu } from './profile-menu/profile-menu';

type Props = {
	left?: React.ReactNode;
	right?: React.ReactNode;
	className?: string;
};

export function Navbar({ children, left, right, className }: PropsWithChildren<Props>) {
	return (
		<header className={cn('w-full py-4 bg-background border-b flex flex-col', className)}>
			<div className='container max-w-6xl mx-auto'>
				<div className='flex justify-between'>
					<div className='flex justify-start items-center'>
						<Link href='/' className='text-xl font-semibold leading-none'>
							hours.frc.sh
						</Link>
						{left}
					</div>

					<div className='flex justify-end'>
						<ProfileMenu />
						{right}
					</div>
				</div>

				{children}
			</div>
		</header>
	);
}
