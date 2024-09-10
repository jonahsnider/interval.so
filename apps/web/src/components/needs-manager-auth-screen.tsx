import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { captureException } from '@sentry/nextjs';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import { unstable_noStore as noStore } from 'next/cache';
import type { PropsWithChildren } from 'react';
import { trpcServer } from '../trpc/trpc-server';
import { NotManagerOfTeamCard } from './needs-any-auth-screen/needs-any-auth-screen.client';
import { MainContent } from './page-wrappers/main-content';

function NeedsSignedInCard() {
	return (
		<Card className='text-nowrap max-w-min [view-transition-name:auth-card]'>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>Not signed in</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					You must be signed in to access this page.
				</CardDescription>
			</CardContent>
			<CardFooter className='justify-end gap-2'>
				{/* Sign up button doesn't get a view transition :( */}
				<Button asChild={true} variant='secondary'>
					<Link href='/signup'>Sign up</Link>
				</Button>
				<Button asChild={true} className='[view-transition-name:auth-card-button]'>
					<Link href='/login'>
						<span className='[view-transition-name:auth-card-button-inner]'>Login</span>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

type Props = PropsWithChildren<{
	className?: string;
	/** If specified, require the user to be a manager of this team. */
	team?: Pick<TeamSchema, 'slug' | 'displayName'>;
}>;

export async function NeedsManagerAuthScreen({ children, className, team }: Props) {
	noStore();

	try {
		const { user } = await trpcServer.user.getSelf.query();

		if (user) {
			if (!team || Object.hasOwn(user.teams, team.slug)) {
				return <>{children}</>;
			}

			return (
				<MainContent className={clsx('items-center justify-center', className)}>
					<NotManagerOfTeamCard user={user} team={team} />
				</MainContent>
			);
		}
	} catch (error) {
		captureException(error);

		return (
			<MainContent className={clsx('items-center justify-center', className)}>
				<Card>
					<CardHeader>
						<CardTitle>Error</CardTitle>
						<CardDescription>An error occurred while loading your account.</CardDescription>
					</CardHeader>
				</Card>
			</MainContent>
		);
	}

	return (
		<MainContent className={clsx('items-center justify-center', className)}>
			<NeedsSignedInCard />
		</MainContent>
	);
}
