import { columns } from '@/src/components/admin/meetings/columns';
import { MeetingsTable } from '@/src/components/admin/meetings/meetings-table';
import { trpcServer } from '@/src/trpc/trpc-server';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function AdminMeetingsPage({ params }: Props) {
	const team = { slug: params.team };
	const data = await trpcServer.teams.meetings.getMeetings.query({
		team,
		// TODO: Make this fetching legit and not super hacky
		timeRange: { start: new Date(1970), end: new Date() },
	});

	return (
		<div className='flex flex-col gap-4'>
			<MeetingsTable columns={columns} data={data} />
		</div>
	);
}
