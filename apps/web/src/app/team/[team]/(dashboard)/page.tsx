import { AdminTiles } from '@/src/components/team-dashboard/admin-tiles/admin-tiles';
import { MembersTable } from '@/src/components/team-dashboard/members-table/members-table';
import { trpcServer } from '@/src/trpc/trpc-server';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default async function HomePage({ params }: Props) {
	const { user } = await trpcServer.user.getSelf.query();

	const initialMembers = await trpcServer.teams.members.simpleMemberList.query({ slug: params.team });

	// TODO: Make this stream - do the same strategy of a skeleton component, just a table with all the text set to skeletons + some dummy rows (also skeletons)

	return (
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				{user && <AdminTiles team={{ slug: params.team }} />}
				<MembersTable members={initialMembers} />
			</div>
		</div>
	);
}
