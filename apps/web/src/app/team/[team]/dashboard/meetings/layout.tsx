import { CreateMeetingDialog } from '@/src/components/manager/meetings/create-meeting-dialog/create-meeting-dialog';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ManagerMeetingsPageLayout({ children, params }: Props) {
	const team = { slug: params.team };

	return (
		<>
			<PageHeader title='Meetings'>
				<CreateMeetingDialog team={team} className='max-w-min' />
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
