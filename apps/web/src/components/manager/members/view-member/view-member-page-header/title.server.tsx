import { PencilSquareIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { EditMemberNameDialog } from '@/src/components/manager/members/view-member/edit-member-name-dialog';
import { trpcServer } from '@/src/trpc/trpc-server';
import { TitleClient } from './title.client';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
};

export async function Title({ member }: Props) {
	const dbMember = await trpcServer.teams.members.getMember.query(member);

	return (
		<EditMemberNameDialog
			member={{
				id: member.id,
				name: dbMember.name,
			}}
		>
			<button
				type='button'
				className='group flex items-center justify-center gap-1 border-transparent hover:bg-muted rounded-md p-1 -ml-1'
			>
				<TitleClient member={member} initialMember={dbMember} />

				<PencilSquareIcon className='h-6 w-6 -translate-x-1 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0' />
			</button>
		</EditMemberNameDialog>
	);
}
