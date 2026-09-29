import { ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/src/trpc/trpc-client';

type Props = {
	member: Pick<TeamMemberSchema, 'id' | 'name' | 'signedInAt'>;
};

export function UpdateAttendanceItem({ member }: Props) {
	const trpc = useTRPC();
	const [toastId, setToastId] = useState<string | number | undefined>();

	const mutation = useMutation(
		trpc.teams.members.updateAttendance.mutationOptions({
			onMutate: ({ data }) => {
				setToastId(toast.loading(`Signing ${member.name} ${data.atMeeting ? 'in' : 'out'}...`));
			},
			onSuccess: (_data, { data }) => {
				toast.success(`Signed ${member.name} ${data.atMeeting ? 'in' : 'out'}`, { id: toastId });
			},
			onError: (error, { data }) => {
				toast.error(`An error occurred while signing ${member.name} ${data.atMeeting ? 'in' : 'out'}`, {
					description: error.message,
					id: toastId,
				});
			},
		}),
	);

	return (
		<DropdownMenuItem onClick={() => mutation.mutate({ member, data: { atMeeting: !member.signedInAt } })}>
			{member.signedInAt && <ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />}
			{!member.signedInAt && <ArrowLeftEndOnRectangleIcon className='h-4 w-4 mr-2' />}
			Sign {member.signedInAt ? 'out' : 'in'}
		</DropdownMenuItem>
	);
}
