import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import { ReactNode } from 'react';

type Props = {
	className?: string;

	left?: ReactNode;
	right?: ReactNode;
	bottom?: ReactNode;
};

export function BaseNavbar({ className, left, bottom, right }: Props) {
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

					{right}
				</div>

				{bottom}
			</div>
		</header>
	);
}