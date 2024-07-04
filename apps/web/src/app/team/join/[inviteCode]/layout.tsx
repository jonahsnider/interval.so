import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		inviteCode: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamInviteLayout({ children }: Props) {
	return (
		<>
			<Navbar />

			<MainContent className='items-center justify-center'>{children}</MainContent>
		</>
	);
}
