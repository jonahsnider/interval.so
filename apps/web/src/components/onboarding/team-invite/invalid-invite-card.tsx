import { Link } from 'next-view-transitions';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function InvalidInviteCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Invalid invite</CardTitle>
				<CardDescription>
					The invite link you clicked is no longer valid or has expired. Please ask a team manager for a new invite.
				</CardDescription>
			</CardHeader>

			<CardFooter className='justify-end'>
				<Button asChild={true}>
					<Link href='/'>Home</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
