import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LeaveTeamCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Leave team</CardTitle>
				<CardDescription>Revoke your access to this team.</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4'>
				<Button variant='outline'>Leave</Button>
			</CardFooter>
		</Card>
	);
}
