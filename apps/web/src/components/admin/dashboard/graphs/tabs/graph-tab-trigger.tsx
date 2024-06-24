type Props = {
	active: boolean;
	title: string;
	measure: number;
	trend: number | undefined;
	className?: string;
	href: string;
};

import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';

export function GraphTabTrigger({ measure, title, trend, className, href, active }: Props) {
	return (
		<Link
			href={href}
			className={clsx(
				'p-4 border-b-2 border-r flex flex-col gap-2 leading-none min-w-56 items-start',
				{
					'dark:bg-muted/30 border-b-transparent': !active,
					'bg-background border-b-primary': active,
				},
				className,
			)}
		>
			<p className='font-semibold text-sm text-muted-foreground'>{title}</p>

			{trend && (
				<div
					className={clsx('flex gap-4 justify-center items-center', {
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
		</Link>
	);
}
