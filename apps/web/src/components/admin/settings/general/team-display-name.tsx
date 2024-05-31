import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function TeamDisplayNameCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team display name</CardTitle>
				<CardDescription>This is your team's visible name within hours.frc.sh.</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<Input className='max-w-80' value='Team 581' />
				</form>
			</CardContent>
			<CardFooter className='border-t px-6 py-4'>
				<Button>Save</Button>
			</CardFooter>
		</Card>
	);
}
