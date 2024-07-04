import { trpcServer } from '@/src/trpc/trpc-server';
import { unstable_noStore as noStore } from 'next/cache';
import type { ReactNode } from 'react';

type Props = {
	authed: ReactNode;
	landing: ReactNode;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamSelectConditionalLayout({ authed, landing }: Props) {
	noStore();
	const { user } = await trpcServer.user.getSelf.query();

	return <>{user ? authed : landing}</>;
}
