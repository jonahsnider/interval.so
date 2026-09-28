import { getSelf } from '@/src/trpc/trpc-server';
import { AlreadyAuthedCardInner } from './already-authed-card.client';

export async function AlreadyAuthedCard({ title }: { title: string }) {
	const { user } = await getSelf();

	if (!user) {
		return undefined;
	}

	return <AlreadyAuthedCardInner displayName={user.displayName} title={title} />;
}
