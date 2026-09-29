import { PlusIcon } from '@heroicons/react/16/solid';
import { type PropsWithChildren, Suspense } from 'react';
import { CreateMemberDialog } from '@/src/components/members/create-member/create-member-dialog';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function CreateMemberAction({ params }: Pick<Props, 'params'>) {
	const { team: teamSlug } = await params;
	const team = { slug: teamSlug };

	return (
		<CreateMemberDialog team={team} variant='default' className='max-w-min'>
			<PlusIcon className='h-4 w-4 mr-2' />
			Add member
		</CreateMemberDialog>
	);
}

export default function ManagerMembersPageLayout({ children, params }: Props) {
	return (
		<>
			<PageHeader title='Members'>
				<Suspense>
					<CreateMemberAction params={params} />
				</Suspense>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
