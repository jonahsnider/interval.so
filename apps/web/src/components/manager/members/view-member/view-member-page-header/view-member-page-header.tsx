import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { Link } from 'next-view-transitions';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/src/components/page-header';
import { MemberActionsDropdown } from '../member-actions-dropdown/member-actions-dropdown.server';
import { Title } from './title.server';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	member: Pick<TeamMemberSchema, 'id'>;
};

export function ViewMemberPageHeader({ team, member }: Props) {
	return (
		<PageHeader
			// Always flex row, the dropdown for actions is small enough it can be on the same line
			className='flex-row justify-between'
			title={
				<div className='flex flex-col items-start gap-2'>
					<Title member={member} />

					{/* Negative margin to align link buttons with the start/end of the title */}
					<Link
						href={`/team/${team.slug}/dashboard/members`}
						// 4 margin from the button, 1 margin from the title padding
						className={cn(buttonVariants({ variant: 'link' }), '-ml-3')}
					>
						<ArrowLeftIcon className='h-4 w-4 mr-2' />
						Back
					</Link>
				</div>
			}
		>
			<MemberActionsDropdown member={member} />
		</PageHeader>
	);
}
