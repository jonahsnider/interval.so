import type { PropsWithChildren } from 'react';
import { CreateMeetingDialog } from '@/src/components/manager/meetings/create-meeting-dialog/create-meeting-dialog';
import { DownloadMeetingsCsvButton } from '@/src/components/manager/meetings/download-meetings-csv-button';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

export default async function ManagerMeetingsPageLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	const team = { slug: params.team };

	return (
		<>
			<PageHeader title='Meetings'>
				<div className='flex gap-4 sm:gap-8'>
					<DownloadMeetingsCsvButton team={team} />
					<CreateMeetingDialog team={team} className='max-w-min' />
				</div>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
