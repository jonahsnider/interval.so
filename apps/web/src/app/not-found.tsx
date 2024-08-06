import { MainContent } from '../components/main-content';
import { Navbar } from '../components/navbar/navbar';
import { NotFoundPageContent } from '../components/not-found-content';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function NotFoundPage() {
	return (
		<>
			<Navbar />

			<MainContent>
				<NotFoundPageContent />
			</MainContent>
		</>
	);
}
