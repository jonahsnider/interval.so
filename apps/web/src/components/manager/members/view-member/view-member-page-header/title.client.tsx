'use client';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { PageHeaderTitle } from '@/src/components/page-header';
import { useLiveMember } from '@/src/trpc/live-queries';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	initialMember: Pick<TeamMemberSchema, 'name'>;
};

export function TitleClient({ member, initialMember }: Props) {
	const { data } = useLiveMember(member);
	const memberName = data?.name ?? initialMember.name;

	return <PageHeaderTitle className='whitespace-pre transition-colors p-1 rounded-md'>{memberName}</PageHeaderTitle>;
}
