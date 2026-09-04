import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Footer } from '../footer/footer';

type Props = PropsWithChildren<{
	className?: string;
}>;

export function FooterWrapper({ children, className }: Props) {
	return (
		<div className={clsx('min-h-screen flex flex-col', className)}>
			<div className='flex-1 w-full flex flex-col'>{children}</div>
			<Footer />
		</div>
	);
}
