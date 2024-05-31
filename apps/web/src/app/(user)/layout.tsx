import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import type { PropsWithChildren } from 'react';

export default function UserPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<Navbar />

			<MainContent>{children}</MainContent>
		</>
	);
}
