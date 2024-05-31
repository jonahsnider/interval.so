import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// This is basically the same as LiveMemberCountTile but a different style
// ex. Header at bottom instead of top
export function MemberCountTile() {
	const memberCount = 24;

	return (
		<Card className='h-full w-full'>
			<CardHeader>
				<CardTitle>Members</CardTitle>
				<CardTitle className='text-3xl lg:text-4xl'>{memberCount} members</CardTitle>
			</CardHeader>
		</Card>
	);
}
