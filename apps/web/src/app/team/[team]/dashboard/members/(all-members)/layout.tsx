import { PlusIcon } from '@heroicons/react/16/solid';
import type { PropsWithChildren } from 'react';
import { CreateMemberDialog } from '@/src/components/members/create-member/create-member-dialog';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

export default async function ManagerMembersPageLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	const team = { slug: params.team };

	return (
		<>
			<PageHeader title='Members'>
				<CreateMemberDialog team={team} variant='default' className='max-w-min'>
					<PlusIcon className='h-4 w-4 mr-2' />
					Add member
				</CreateMemberDialog>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
