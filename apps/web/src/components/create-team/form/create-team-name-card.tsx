import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CreateTeamNameCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team name</CardTitle>
				<CardDescription>Please enter a display name for the new team.</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<Input className='max-w-80' value='Team 581' />
				</form>
			</CardContent>
		</Card>
	);
}
