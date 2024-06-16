import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { SlashIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';
import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
	team: Partial<Pick<TeamSchema, 'slug'>> & { displayName: ReactNode };
}>;

export function SlashSeparatedNavbarItem({ team, children }: Props) {
	const Outer = team.slug
		? ({ children, className }: PropsWithChildren<{ className?: string }>) => (
				<Link href={`/team/${team.slug}`} className={className}>
					{children}
				</Link>
			)
		: 'div';

	return (
		<Outer className='flex items-center leading-none'>
			<div className='px-2 text-muted-foreground'>
				<SlashIcon height={20} width={20} />
			</div>

			<div className='pr-2'>{team.displayName}</div>

			{children}
		</Outer>
	);
}
