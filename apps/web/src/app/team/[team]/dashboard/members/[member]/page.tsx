import { MemberAttendanceSection } from '@/src/components/manager/members/view-member/member-attendance-section/member-attendance-section';
import { searchParamCache } from '@/src/components/manager/members/view-member/search-params';
import { ViewMemberPageHeader } from '@/src/components/manager/members/view-member/view-member-page-header/view-member-page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = {
	params: Promise<{
		team: string;
		member: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ViewMemberPage(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
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
