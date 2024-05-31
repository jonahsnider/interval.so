import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CreateTeamUrlCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team URL</CardTitle>
				<CardDescription>
					This is your team's URL on the hours.frc.sh platform. Team members can use this URL to access your team's
					page.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<div className='flex'>
						<span className='flex h-9 items-center justify-center rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm transition-colors cursor-not-allowed rounded-r-none border-r-0 text-muted-foreground'>
							https://hours.frc.sh/team/
						</span>
						<Input className='max-w-80 rounded-l-none' value='team581' />
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
