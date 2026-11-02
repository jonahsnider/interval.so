'use client';

import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/16/solid';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../page-header';
import { MainContent } from '../page-wrappers/main-content';
import { DashboardPageLoading, NavbarLoading, SettingsContentLoading } from '../route-loading';
import { TeamSlugProvider } from '../team-dashboard/team-slug-provider';
import { MeetingsTableLoading } from './meetings/meetings-table/meetings-table.client';
import { MembersTableLoading } from './members/members-table/members-table.client';
import ViewMemberPageLoading from './members/view-member/view-member-page-loading';

export function ManagerRouteLoading() {
	return (
		<>
			<NavbarLoading manager />
			<ManagerPageLoading />
		</>
	);
}

export function ManagerPageLoading() {
	// Dynamic route hooks can suspend while Next.js prerenders the shell.
	return (
		<Suspense>
			<ManagerPageLoadingContent />
		</Suspense>
	);
}

function ManagerPageLoadingContent() {
	const { team, member } = useParams<{ team: string; member?: string }>();
	const section = useSelectedLayoutSegment();
	let content;
	switch (section) {
		case 'members':
			content = member ? (
				<ViewMemberPageLoading />
			) : (
				<>
					<PageHeader title='Members'>
						<Button disabled className='max-w-min'>
							<PlusIcon className='h-4 w-4 mr-2' />
							Add member
						</Button>
					</PageHeader>
					<MainContent>
						<MembersTableLoading />
					</MainContent>
				</>
			);
			break;
		case 'meetings':
			content = (
				<>
					<PageHeader title='Meetings'>
						<div className='flex gap-4 sm:gap-8'>
							<Button disabled variant='outline'>
								<ArrowDownTrayIcon className='h-4 w-4 mr-2' />
								Download CSV
							</Button>
							<Button disabled className='max-w-min'>
								<PlusIcon className='h-4 w-4 mr-2' />
								Add meeting
							</Button>
						</div>
					</PageHeader>
					<MainContent>
						<MeetingsTableLoading />
					</MainContent>
				</>
			);
			break;
		case 'settings':
			content = (
				<>
					<PageHeader title='Team settings' />
					<MainContent className='pt-8'>
						<div className='grid grid-cols-4 gap-8'>
							<SettingsContentLoading />
						</div>
					</MainContent>
				</>
			);
			break;
		default:
			content = <DashboardPageLoading />;
	}
	return <TeamSlugProvider team={{ slug: team }}>{content}</TeamSlugProvider>;
}
