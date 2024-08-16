'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogOut } from '@/src/hooks/log-out';

export function AlreadyAuthedCardInner({ displayName, title }: { displayName: string; title: string }) {
	const logOut = useLogOut();

	return (
		<Card className='[view-transition-name:auth-card]'>
			<CardHeader>
				<CardTitle className='[view-transition-name:auth-card-title]'>{title}</CardTitle>
			</CardHeader>

			<CardContent>
				<CardDescription className='[view-transition-name:auth-card-description]'>
					You're already signed in as {displayName}.
				</CardDescription>
			</CardContent>

			<CardFooter className='justify-end'>
				<Button disabled={logOut.isPending} onClick={logOut.logOut} className='[view-transition-name:auth-card-button]'>
					Log out
				</Button>
			</CardFooter>
		</Card>
	);
}
