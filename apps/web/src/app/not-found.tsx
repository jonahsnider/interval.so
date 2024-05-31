import { NotFoundPageContent } from '../components/not-found-content';
import UserPageLayout from './(user)/layout';

export default function NotFoundPage() {
	return (
		<UserPageLayout>
			<NotFoundPageContent />
		</UserPageLayout>
	);
}
