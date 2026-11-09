import { PencilSquareIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { ensureEntry, loadHandles } from '@trpc/tanstack-react-query/unstable-handles';
import { EditMemberNameDialog } from '@/src/components/manager/members/view-member/edit-member-name-dialog';
import { HydrateClient, trpc } from '@/src/trpc/trpc-server';
import { TitleClient } from './title.client';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
};

export async function Title({ member }: Props) {
	const [handles, { member: dbMember }] = await loadHandles(trpc, {
		member: ensureEntry(trpc.teams.members.getMember, member),
	});

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
				<HydrateClient>
					<TitleClient memberHandle={handles.member} initialName={dbMember.name} />
				</HydrateClient>

				<PencilSquareIcon className='h-6 w-6 -translate-x-1 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0' />
			</button>
		</EditMemberNameDialog>
	);
}
