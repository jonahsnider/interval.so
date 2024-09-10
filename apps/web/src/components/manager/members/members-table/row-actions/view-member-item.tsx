import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { Link } from 'next-view-transitions';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	member: Pick<TeamMemberSchema, 'id'>;
};

export function ViewMemberItem({ team, member }: Props) {
	return (
		<DropdownMenuItem asChild={true}>
			<Link href={`/team/${team.slug}/dashboard/members/${member.id}`}>
				<MagnifyingGlassIcon className='h-4 w-4 mr-2' />
				View
			</Link>
		</DropdownMenuItem>
	);
}
