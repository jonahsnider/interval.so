import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function DeleteTeamCard() {
	return (
		<Card className='border-destructive-muted'>
			<CardHeader>
				<CardTitle>Delete team</CardTitle>
				<CardDescription>
					Permanently delete this team and all of its contents. This action is not reversible, so please continue with
					caution.
				</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4 bg-destructive-muted border-destructive-muted'>
				<Button variant='destructive'>Delete team</Button>
			</CardFooter>
		</Card>
	);
}
