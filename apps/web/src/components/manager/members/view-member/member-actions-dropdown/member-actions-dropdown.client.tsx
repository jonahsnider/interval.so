'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { type MemberHandle, useLiveMember } from '@/src/trpc/live-queries';
import { MemberRowActionsDropdown } from '../../members-table/row-actions/row-actions-dropdown';

type Props = {
	memberHandle: MemberHandle;
};

export function MemberActionsDropdownClient({ memberHandle }: Props) {
	const { data: memberData } = useLiveMember(memberHandle);
	if (!memberData) return <Skeleton className='h-9 w-9' />;

	return (
		<MemberRowActionsDropdown
			variant='standalone'
			member={{
				id: memberHandle.input.id,
				...memberData,
			}}
		/>
	);
}
