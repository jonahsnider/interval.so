import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { Navbar } from '@/src/components/navbar/navbar';
import { MainContent } from '@/src/components/page-wrappers/main-content';

import { isTrpcClientError } from '@/src/trpc/common';
import { trpcServer } from '@/src/trpc/trpc-server';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamAttendanceLayout(props: Props) {
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
