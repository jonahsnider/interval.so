import { type PropsWithChildren, ViewTransition } from 'react';
import { cn } from '@/lib/utils';
import dotsStyles from '../dots/dots.module.css';

type Props = PropsWithChildren<{
	className?: string;
	transition?: boolean;
}>;

export function MainContent({ children, className, transition = true }: Props) {
	const content = <div className={cn('mx-auto container max-w-6xl flex flex-col flex-1', className)}>{children}</div>;

	return (
		<main className={cn('py-4 flex-1 flex', dotsStyles.dots)}>
			{transition ? <ViewTransition name='main-content'>{content}</ViewTransition> : content}
		</main>
	);
}
