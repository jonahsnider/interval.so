import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { type PropsWithChildren, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { GuestTeamNavbarItem } from '../team-dashboard/navbar/guest-team-navbar-item';
import { TeamDropdown } from '../team-dashboard/navbar/team-dropdown/team-dropdown.server';
import { BaseNavbar } from './base-navbar';
import { ProfileMenu } from './profile-menu/profile-menu';

type Props = {
	className?: string;
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function Navbar({ children, currentTeam, className }: PropsWithChildren<Props>) {
	return (
		<BaseNavbar
			className={className}
			left={
				<>
					<ErrorBoundary fallback={<span />}>
						<Suspense>
							<TeamDropdownItem currentTeam={currentTeam} />
						</Suspense>
					</ErrorBoundary>
					<GuestTeamNavbarItem />
				</>
			}
			right={
				<div className='flex justify-end'>
					<ProfileMenu />
				</div>
			}
			bottom={children}
		/>
	);
}

async function TeamDropdownItem({
	currentTeam,
}: {
	currentTeam?: Pick<TeamSchema, 'slug'>;
}) {
	const { user } = await trpcServer.user.getSelf.query();

	if (!user) {
		return undefined;
	}

	return (
		<div className='flex justify-start items-center'>
			<TeamDropdown currentTeam={currentTeam} />
		</div>
	);
}
