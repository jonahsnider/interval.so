import { Suspense } from 'react';
import { MembersTable } from '@/src/components/manager/members/members-table/members-table';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

async function ManagerMembersPageContent(props: Props) {
	const params = await props.params;
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<MembersTable team={team} />
		</div>
	);
}

export default function ManagerMembersPage(props: Props) {
	return (
		<Suspense>
			<ManagerMembersPageContent {...props} />
		</Suspense>
	);
}
