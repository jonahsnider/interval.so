import { CreateTeamCard } from '@/src/components/home/create-team-card';
import { TeamCard } from '@/src/components/home/team-card/team-card.server';
import { trpcServer } from '@/src/trpc/trpc-server';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamSelectPage() {
	// TODO: Make this stream, make it a separate component <TeamCardsForSelf />
	const teams = await trpcServer.teams.forUser.getTeamNames.query();

	return (
		<div className='flex items-center justify-center w-full'>
			<div className='grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 w-full md:max-w-4xl'>
				{teams.map((team) => (
					<TeamCard key={team.slug} team={team} />
				))}
				<CreateTeamCard />
			</div>
		</div>
	);
}
