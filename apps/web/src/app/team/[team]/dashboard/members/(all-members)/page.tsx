import { MembersTable } from '@/src/components/manager/members/members-table/members-table';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

export default async function ManagerMembersPage(props: Props) {
	const params = await props.params;
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MembersTable team={team} />
		</div>
	);
}
