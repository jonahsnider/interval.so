import { SettingsCardSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { Suspense } from 'react';
import { DisplayNameCardInner } from './display-name-card.client';

export function DisplayNameCard() {
	const user = trpcServer.user.getSelf.query().then(({ user }) => {
		if (!user) {
			throw new TypeError('Expected user to be defined if this is being rendered');
		}

		return user;
	});

	return (
		<Suspense fallback={<SettingsCardSkeleton />}>
			<DisplayNameCardInner userPromise={user} />
		</Suspense>
	);
}
