import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { trpc } from '@/src/trpc/trpc-client';
import { ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
	member: TeamMemberSchema;
};

export function UpdateAttendanceItem({ member }: Props) {
	const [toastId, setToastId] = useState<string | number | undefined>();

	const mutation = trpc.teams.members.updateAttendance.useMutation({
		onMutate: ({ atMeeting }) => {
			setToastId(toast.loading(`Signing ${member.name} ${atMeeting ? 'out' : 'in'}...`));
		},
		onSuccess: (_data, { atMeeting }) => {
			toast.success(`Signed ${member.name} ${atMeeting ? 'out' : 'in'}`, { id: toastId });
		},
		onError: (error, { atMeeting }) => {
			toast.error(`An error occurred while signing ${member.name} ${atMeeting ? 'out' : 'in'}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenuItem
			onClick={() =>
				mutation.mutate({
					id: member.id,
					atMeeting: !member.atMeeting,
				})
			}
		>
			{member.atMeeting && <ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />}
			{!member.atMeeting && <ArrowLeftEndOnRectangleIcon className='h-4 w-4 mr-2' />}
			Sign {member.atMeeting ? 'out' : 'in'}
		</DropdownMenuItem>
	);
}
