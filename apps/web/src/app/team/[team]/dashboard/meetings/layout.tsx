import { CreateMeetingDialog } from '@/src/components/manager/meetings/create-meeting-dialog';
import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
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
				<CreateMeetingDialog team={team} />
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
