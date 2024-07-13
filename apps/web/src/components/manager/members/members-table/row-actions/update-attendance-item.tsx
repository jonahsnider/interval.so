import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	member: Pick<TeamMemberSchema, 'id' | 'name' | 'signedInAt'>;
};

export function UpdateAttendanceItem({ member }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const mutation = trpc.teams.members.updateAttendance.useMutation({
		onMutate: ({ data }) => {
			setToastId(toast.loading(`Signing ${member.name} ${data.atMeeting ? 'out' : 'in'}...`));
		},
		onSuccess: (_data, { data }) => {
			toast.success(`Signed ${member.name} ${data.atMeeting ? 'out' : 'in'}`, { id: toastId });
		},
		onError: (error, { data }) => {
			toast.error(`An error occurred while signing ${member.name} ${data.atMeeting ? 'out' : 'in'}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenuItem onClick={() => mutation.mutate({ member, data: { atMeeting: !member.signedInAt } })}>
			{member.signedInAt && <ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />}
			{!member.signedInAt && <ArrowLeftEndOnRectangleIcon className='h-4 w-4 mr-2' />}
			Sign {member.signedInAt ? 'out' : 'in'}
		</DropdownMenuItem>
	);
}
