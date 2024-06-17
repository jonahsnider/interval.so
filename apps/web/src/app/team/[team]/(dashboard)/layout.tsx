import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import { NeedsAnyAuthScreen } from '@/src/components/needs-any-auth-screen';

import { isTrpcClientError } from '@/src/trpc/common';
import { trpcServer } from '@/src/trpc/trpc-server';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamLayout({ children, params }: Props) {
	let displayName: string;
	try {
		displayName = await trpcServer.teams.getDisplayName.query({ slug: params.team });
	} catch (error) {
		if (isTrpcClientError(error) && error.data?.code === 'NOT_FOUND') {
			notFound();
		}

		throw error;
	}

	return (
		<>
			<Navbar currentTeam={{ slug: params.team }} />

			<MainContent>
				<NeedsAnyAuthScreen
					team={{
						slug: params.team,
						displayName,
					}}
				>
					{children}
				</NeedsAnyAuthScreen>
			</MainContent>
		</>
	);
}
