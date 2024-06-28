import { MainContent } from '@/src/components/main-content';
import { CreateMemberDialog } from '@/src/components/members/create-member/create-member-dialog';
import { PageHeader } from '@/src/components/page-header';
import { UserPlusIcon } from '@heroicons/react/16/solid';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminMembersPageLayout({ children, params }: Props) {
	const team = { slug: params.team };

	return (
		<>
			<PageHeader title='Members'>
				<CreateMemberDialog team={team} variant='default'>
					<UserPlusIcon className='h-4 w-4 mr-2' />
					Create member
				</CreateMemberDialog>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
