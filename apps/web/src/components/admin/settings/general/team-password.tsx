import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function TeamPasswordCard() {
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
			<CardFooter className='border-t px-6 py-4'>
				<Button>Save</Button>
			</CardFooter>
		</Card>
	);
}
