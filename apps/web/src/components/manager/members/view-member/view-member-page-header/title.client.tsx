'use client';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { PageHeaderTitle } from '@/src/components/page-header';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useTRPC } from '@/src/trpc/trpc-client';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	initialMember: Pick<TeamMemberSchema, 'name'>;
};

export function TitleClient({ member, initialMember }: Props) {
	const trpc = useTRPC();
	const { data } = useSubscription(trpc.teams.members.getMemberSubscription.subscriptionOptions(member));
	const memberName = data?.name ?? initialMember.name;

	return <PageHeaderTitle className='whitespace-pre transition-colors p-1 rounded-md'>{memberName}</PageHeaderTitle>;
}
