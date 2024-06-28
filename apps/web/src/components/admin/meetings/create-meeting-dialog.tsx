import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

// TODO: Implement this
export function CreateMeetingDialog({ team }: Props) {
	return (
		<Button>
			<PlusIcon className='h-4 w-4 mr-2' />
			Create meeting
		</Button>
	);
}
