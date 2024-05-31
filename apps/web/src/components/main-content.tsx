import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	className?: string;
}>;

export function MainContent({ children, className }: Props) {
	return (
		<main
			className={cn(
				'mx-auto container py-4 [view-transition-name:main-content] max-w-6xl flex-1 flex flex-col',
				className,
			)}
		>
			{children}
		</main>
	);
}
