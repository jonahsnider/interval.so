import { notFound } from 'next/navigation';
import { type PropsWithChildren, Suspense } from 'react';
import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { Navbar } from '@/src/components/navbar/navbar';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { isTrpcClientError } from '@/src/trpc/common';
import { trpcServer } from '@/src/trpc/trpc-server';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function TeamAttendanceContent(props: Props) {
	const params = await props.params;

	const { children } = props;

	let displayName: string;
	try {
		displayName = await trpcServer.teams.settings.getDisplayName.query({ slug: params.team });
	} catch (error) {
		if (isTrpcClientError(error) && error.data?.code === 'NOT_FOUND') {
			notFound();
		}

		throw error;
	}

	return (
		<>
			<Navbar currentTeam={{ slug: params.team }} />

			<AuthWall
				kind='guestOrManager'
				wantedTeam={{
					slug: params.team,
					displayName,
				}}
			>
				<MainContent>{children}</MainContent>
			</AuthWall>
		</>
	);
}

export default function TeamAttendanceLayout(props: Props) {
	return (
		<Suspense>
			<TeamAttendanceContent {...props} />
		</Suspense>
	);
}
