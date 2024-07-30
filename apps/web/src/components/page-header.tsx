import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { type PropsWithChildren, type ReactNode, Suspense } from 'react';

type Props = PropsWithChildren<{
	title: ReactNode;
	description?: ReactNode;
	className?: string;
}>;

export function PageHeaderTitle({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) {
	return (
		<Suspense fallback={<Skeleton className='h-7 sm:h-9 w-56' />}>
			<h1 className={clsx('text-3xl sm:text-4xl leading-none sm:leading-none font-serif font-medium', className)}>
				{children}
			</h1>
		</Suspense>
	);
}

export function PageHeaderDescription({ children }: PropsWithChildren) {
	return <p className='text-muted-foreground'>{children}</p>;
}

export function PageHeader({ title, description, children, className }: Props) {
	return (
		<header className='py-8 border border-t-0 bg-background'>
			<div className={cn('flex flex-col xs:flex-row xs:justify-between gap-4 mx-auto container max-w-6xl', className)}>
				<div className='flex flex-col gap-4'>
					{typeof title === 'string' ? <PageHeaderTitle>{title}</PageHeaderTitle> : title}
					{typeof description === 'string' ? <PageHeaderDescription>{description}</PageHeaderDescription> : description}
				</div>

				{children}
			</div>
		</header>
	);
}
