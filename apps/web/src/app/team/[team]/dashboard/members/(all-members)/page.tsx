import { MembersTable } from '@/src/components/manager/members/members-table/members-table';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function ManagerMembersPage(props: Props) {
	const params = await props.params;
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MembersTable team={team} />
		</div>
	);
}
