import { MembersTable } from '@/src/components/manager/members/members-table/members-table';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ManagerMembersPage({ params }: Props) {
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MembersTable team={team} />
		</div>
	);
}
