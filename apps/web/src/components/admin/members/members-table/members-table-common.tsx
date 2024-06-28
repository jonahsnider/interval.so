import type { PropsWithChildren } from 'react';

export function OuterTableContainer({ children }: PropsWithChildren) {
	return <div className='flex flex-col gap-4'>{children}</div>;
}

export function InnerTableContainer({ children }: PropsWithChildren) {
	return <div className='rounded-md border bg-background whitespace-nowrap'>{children}</div>;
}
