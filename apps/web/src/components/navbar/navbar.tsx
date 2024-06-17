import { cn } from '@/lib/utils';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import type { PropsWithChildren } from 'react';
import { GuestTeamNavbarItem } from '../team-dashboard/navbar/guest-team-navbar-item';
import { TeamDropdown } from '../team-dashboard/navbar/team-dropdown/team-dropdown.server';
import { ProfileMenu } from './profile-menu/profile-menu';

type Props = {
	className?: string;
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export async function Navbar({ children, currentTeam, className }: PropsWithChildren<Props>) {
	// TODO: Make this stream with Suspense instead of blocking
	const [{ user }, guestTeam] = await Promise.all([
		trpcServer.user.getSelf.query(),
		trpcServer.guestLogin.getCurrentGuestTeam.query(),
	]);

	return (
		<header className={cn('w-full py-4 bg-background border-b flex flex-col', className)}>
			<div className='container max-w-6xl mx-auto'>
				<div className='flex justify-between'>
					<div className='flex justify-start items-center'>
						<Link href='/' className='text-xl font-semibold leading-none'>
							hours.frc.sh
						</Link>
						{user && (
							<div className='flex justify-start items-center'>
								<TeamDropdown currentTeam={currentTeam} />
							</div>
						)}
						{guestTeam && <GuestTeamNavbarItem team={guestTeam} />}
					</div>

					<div className='flex justify-end'>
						<ProfileMenu />
					</div>
				</div>

				{children}
			</div>
		</header>
	);
}
