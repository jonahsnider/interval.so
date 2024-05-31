import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CreateTeamPasswordCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team password</CardTitle>
				<CardDescription>
					Visitors to your team URL must enter a password in order to gain access to the sign in form.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<Input className='max-w-80' value='secret123' />
				</form>
			</CardContent>
		</Card>
	);
}
