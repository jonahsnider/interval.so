import { TeamCards } from '@/src/components/home/team-cards';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamSelectPage() {
	return (
		<div className='flex items-center justify-center w-full'>
			<TeamCards />
		</div>
	);
}
