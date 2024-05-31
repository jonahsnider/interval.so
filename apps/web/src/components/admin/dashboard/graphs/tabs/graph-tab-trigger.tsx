'use client';

type Props = {
	value: string;
	title: string;
	measure: number;
	trend: number | undefined;
	selected: string;
	className?: string;
};

import { Badge } from '@/components/ui/badge';
import { Trigger } from '@radix-ui/react-tabs';
import clsx from 'clsx';

export function GraphTabTrigger({ value, measure, selected, title, trend, className }: Props) {
	const active = selected === value;

	return (
		<Trigger
			value={value}
			className={clsx(
				'p-4 border-b-2 border-r transition-colors flex flex-col gap-2 leading-none min-w-56',
				{
					'dark:bg-muted/30 border-b-transparent': !active,
					'bg-background border-b-primary': active,
				},
				className,
			)}
		>
			<p className='font-bold text-sm text-muted-foreground'>{title}</p>

			{trend && (
				<div
					className={clsx('flex gap-4 justify-center items-center transition-opacity', {
						'opacity-80': !active,
					})}
				>
					<p className={clsx('text-3xl font-semibold')}>{measure}</p>

					<Badge
						className={clsx('shadow-none', {
							'hover:bg-primary': trend > 0,
							'hover:bg-destructive': trend < 0,
						})}
						variant={trend > 0 ? 'default' : 'destructive'}
					>
						{trend > 0 && '+'}
						{Math.round(trend * 100)}%
					</Badge>
				</div>
			)}
		</Trigger>
	);
}
