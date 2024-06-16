import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { PropsWithChildren } from 'react';
import { Navbar } from '../../navbar/navbar';
import { GuestTeamNavbarItem } from './guest-team-navbar-item';
import { TeamDropdown } from './team-dropdown/team-dropdown.server';

type Props = PropsWithChildren<{
	className?: string;
	currentTeam?: Pick<TeamSchema, 'slug'>;
}>;

export async function TeamPageNavbar({ className, children, currentTeam }: Props) {
	const [{ user }, guestTeam] = await Promise.all([
		trpcServer.user.getSelf.query(),
		trpcServer.guestLogin.getCurrentGuestTeam.query(),
	]);

	return (
		<Navbar
			className={className}
			left={
				<>
					{user && (
						<div className='flex justify-start items-center'>
							<TeamDropdown currentTeam={currentTeam} />
						</div>
					)}
					{guestTeam && <GuestTeamNavbarItem team={guestTeam} />}
				</>
			}
		>
			{children}
		</Navbar>
	);
}
