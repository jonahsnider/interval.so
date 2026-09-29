import { type PropsWithChildren, ViewTransition } from 'react';
import { cn } from '@/lib/utils';
import dotsStyles from '../dots/dots.module.css';

type Props = PropsWithChildren<{
	className?: string;
}>;

export function MainContent({ children, className }: Props) {
	return (
		<main className={cn('py-4 flex-1 flex', dotsStyles.dots)}>
			<ViewTransition name='main-content'>
				<div className={cn('mx-auto container max-w-6xl flex flex-col flex-1', className)}>{children}</div>
			</ViewTransition>
		</main>
	);
}
