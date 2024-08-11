import { MemberAttendanceSection } from '@/src/components/manager/members/view-member/member-attendance-section/member-attendance-section';
import { searchParamCache } from '@/src/components/manager/members/view-member/search-params';
import { ViewMemberPageHeader } from '@/src/components/manager/members/view-member/view-member-page-header/view-member-page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

type Props = {
	params: {
		team: string;
		member: string;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ViewMemberPage({ params, searchParams }: Props) {
	searchParamCache.parse(searchParams);

	const member = { id: params.member };
	const team = { slug: params.team };

	return (
		<>
			<ViewMemberPageHeader team={team} member={member} />

			<MainContent className='gap-4'>
				<MemberAttendanceSection member={member} />
			</MainContent>
		</>
	);
}
