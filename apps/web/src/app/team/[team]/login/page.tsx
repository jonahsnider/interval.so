import { Button } from '@/components/ui/button';
import { Navbar } from '@/src/components/navbar/navbar';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { AlreadyAuthedCard } from '@/src/components/team-dashboard/password-login/already-authed-card';

import { PasswordLoginCard } from '@/src/components/team-dashboard/password-login/password-login-card';
import { isTrpcClientError } from '@/src/trpc/common';
import { trpcServer } from '@/src/trpc/trpc-server';
import { ArrowRightIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { notFound } from 'next/navigation';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

async function Inner({ team }: { team: Pick<TeamSchema, 'slug' | 'displayName'> }) {
	const guestTeam = await trpcServer.guestLogin.getCurrentGuestTeam.query();

	if (guestTeam) {
		if (guestTeam.slug === team.slug) {
			return <AlreadyAuthedCard team={team} />;
		}
	}

	return <PasswordLoginCard team={team} />;
}

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamLoginPage(props: Props) {
	const params = await props.params;
	let displayName: string;
	try {
		displayName = await trpcServer.teams.settings.getDisplayName.query({ slug: params.team });
	} catch (error) {
		if (isTrpcClientError(error) && error.data?.code === 'NOT_FOUND') {
			notFound();
		}

		throw error;
	}

	// TODO: If the user is authed for a different team, add a note that says "You are signed into {other team}"

	return (
		<>
			<Navbar currentTeam={{ slug: params.team }} />

			<MainContent className='flex flex-1 justify-center items-center flex-col'>
				<div className='flex flex-col gap-1'>
					<Inner team={{ slug: params.team, displayName }} />

					<div className='flex justify-start'>
						<Button asChild={true} variant='link'>
							<Link href='/login' className='flex items-center gap-2'>
								Are you a team manager? Login here <ArrowRightIcon className='h-4 w-4' />
							</Link>
						</Button>
					</div>
				</div>
			</MainContent>
		</>
	);
}
