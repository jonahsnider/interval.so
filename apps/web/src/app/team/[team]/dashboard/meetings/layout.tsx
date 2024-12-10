import { CreateMeetingDialog } from '@/src/components/manager/meetings/create-meeting-dialog/create-meeting-dialog';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function ManagerMeetingsPageLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

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
