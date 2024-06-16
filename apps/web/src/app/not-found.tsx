import { NotFoundPageContent } from '../components/not-found-content';
import UserPageLayout from './(user)/layout';

export const dynamic = 'force-dynamic';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function NotFoundPage() {
	return (
		<UserPageLayout>
			<NotFoundPageContent />
		</UserPageLayout>
	);
}
