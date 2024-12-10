import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { ManagerNavbar } from '@/src/components/manager/navbar/manager-navbar';
import { isTrpcClientError } from '@/src/trpc/common';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function ManagerLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	let teamDisplayName: string;

	try {
		teamDisplayName = await trpcServer.teams.settings.getDisplayName.query({ slug: params.team });
	} catch (error) {
		if (isTrpcClientError(error) && error.data?.code === 'NOT_FOUND') {
			notFound();
		}

		throw error;
	}

	const team: Pick<TeamSchema, 'slug' | 'displayName'> = { slug: params.team, displayName: teamDisplayName };

	return (
		<>
			<ManagerNavbar currentTeam={team} />
			<AuthWall kind='manager' wantedTeam={team}>
				{children}
			</AuthWall>
		</>
	);
}
