import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function DisplayNameCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Display name</CardTitle>
				<CardDescription>Please enter your full name, or a display name you are comfortable with.</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<Input className='max-w-80' value='Jonah Snider' />
				</form>
			</CardContent>
			<CardFooter className='border-t px-6 py-4'>
				<Button>Save</Button>
			</CardFooter>
		</Card>
	);
}
