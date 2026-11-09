'use client';
import { PageHeaderTitle } from '@/src/components/page-header';
import { type MemberHandle, useLiveMember } from '@/src/trpc/live-queries';

type Props = {
	memberHandle: MemberHandle;
	initialName: string;
};

export function TitleClient({ memberHandle, initialName }: Props) {
	const { data } = useLiveMember(memberHandle);
	const memberName = data?.name ?? initialName;

	return <PageHeaderTitle className='whitespace-pre transition-colors p-1 rounded-md'>{memberName}</PageHeaderTitle>;
}
