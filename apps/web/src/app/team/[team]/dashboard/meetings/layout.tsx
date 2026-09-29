import { type PropsWithChildren, Suspense } from 'react';
import { CreateMeetingDialog } from '@/src/components/manager/meetings/create-meeting-dialog/create-meeting-dialog';
import { DownloadMeetingsCsvButton } from '@/src/components/manager/meetings/download-meetings-csv-button';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function ManagerMeetingsActions({ params }: Pick<Props, 'params'>) {
	const { team: teamSlug } = await params;
	const team = { slug: teamSlug };

	return (
		<div className='flex gap-4 sm:gap-8'>
			<DownloadMeetingsCsvButton team={team} />
			<CreateMeetingDialog team={team} className='max-w-min' />
		</div>
	);
}

export default function ManagerMeetingsPageLayout({ children, params }: Props) {
	return (
		<>
			<PageHeader title='Meetings'>
				<Suspense>
					<ManagerMeetingsActions params={params} />
				</Suspense>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</>
	);
}
