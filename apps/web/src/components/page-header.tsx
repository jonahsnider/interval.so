import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	title: string;
	description?: string;
	className?: string;
}>;

export function PageHeader({ title, description, children, className }: Props) {
	return (
		<header className='py-8 border border-t-0 bg-background'>
			<div className={cn('flex flex-col xs:flex-row xs:justify-between gap-4 mx-auto container max-w-6xl', className)}>
				<div className='flex flex-col gap-4'>
					<h1 className='text-4xl'>{title}</h1>
					{description && <p className='text-muted-foreground'>{description}</p>}
				</div>

				{children}
			</div>
		</header>
	);
}
