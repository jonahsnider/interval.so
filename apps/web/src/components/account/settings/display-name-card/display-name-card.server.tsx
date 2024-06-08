import assert from 'node:assert/strict';
import { SettingsCardSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { Suspense } from 'react';
import { DisplayNameCardInner } from './display-name-card.client';

async function DisplayNameCardFetcher() {
	const { user } = await trpcServer.user.getSelf.query();

	assert(user, new TypeError('Expected user to be defined if this is being rendered'));

	return <DisplayNameCardInner user={user} />;
}

export function DisplayNameCard() {
	return (
		<Suspense fallback={<SettingsCardSkeleton />}>
			<DisplayNameCardFetcher />
		</Suspense>
	);
}
