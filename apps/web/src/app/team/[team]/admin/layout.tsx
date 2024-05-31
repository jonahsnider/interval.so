import { AdminNavbar } from '@/src/components/admin/navbar/admin-navbar';
import type { PropsWithChildren } from 'react';

export default function AdminLayout({ children }: PropsWithChildren) {
	return (
		<>
			<AdminNavbar />
			{children}
		</>
	);
}
