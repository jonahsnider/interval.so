import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	className?: string;
}>;

export function ReadonlyTextField({ children, className }: Props) {
	return (
		<span
			className={clsx(
				'inline-flex h-9 overflow-y-auto [scrollbar-width:none] items-center justify-start rounded-md border border-input px-3 py-1 text-sm transition-colors bg-muted/40',
				className,
			)}
		>
			{children}
		</span>
	);
}
