import { Button } from '@/components/ui/button';
import { CreateTeamNameCard } from '@/src/components/create-team/form/create-team-name-card';
import { CreateTeamPasswordCard } from '@/src/components/create-team/form/create-team-password';
import { CreateTeamUrlCard } from '@/src/components/create-team/form/create-team-url-card';

export default function CreateTeamPage() {
	return (
		<div className='flex flex-col gap-4'>
			<CreateTeamNameCard />
			<CreateTeamUrlCard />
			<CreateTeamPasswordCard />
			<Button className='max-w-min mx-auto' size='lg'>
				Create team
			</Button>
		</div>
	);
}
