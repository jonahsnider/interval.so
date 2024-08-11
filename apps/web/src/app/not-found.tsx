import { Navbar } from '../components/navbar/navbar';
import { NotFoundPageContent } from '../components/not-found-content';
import { FooterWrapper } from '../components/page-wrappers/footer-wrapper';
import { MainContent } from '../components/page-wrappers/main-content';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function NotFoundPage() {
	return (
		<FooterWrapper>
			<Navbar />

			<MainContent>
				<NotFoundPageContent />
			</MainContent>
		</FooterWrapper>
	);
}
