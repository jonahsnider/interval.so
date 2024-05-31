import { type Meeting, columns } from '@/src/components/admin/meetings/columns';
import { MeetingsTable } from '@/src/components/admin/meetings/meetings-table';

const data: Meeting[] = [
	{
		attendeeCount: 1,
		start: new Date('2024-05-11T12:00:00.000Z'),
		end: new Date('2024-05-11T16:00:00.000Z'),
	},
	{
		attendeeCount: 2,
		start: new Date('2024-05-11T12:00:00.000Z'),
		end: new Date('2024-05-11T16:00:00.000Z'),
	},
	{
		attendeeCount: 3,
		start: new Date('2024-05-27T14:00:00.000Z'),
		end: new Date('2024-05-27T23:05:00.000Z'),
	},
	{
		attendeeCount: 6,
		start: new Date('2024-05-27T14:05:00.000Z'),
		end: new Date('2024-05-27T23:05:00.000Z'),
	},
	{
		attendeeCount: 7,
		start: new Date('2024-05-26T14:00:00.000Z'),
		end: new Date('2024-05-26T23:00:00.000Z'),
	},
	{
		attendeeCount: 7,
		start: new Date('2024-05-26T14:00:00.000Z'),
		end: new Date('2024-05-26T16:00:00.000Z'),
	},
	{
		attendeeCount: 10,
		start: new Date('2024-05-29T14:00:00.000Z'),
		end: new Date('2024-05-29T16:00:00.000Z'),
	},
	{
		attendeeCount: 10,
		start: new Date('2024-05-24T14:00:00.000Z'),
		end: new Date('2024-05-24T16:00:00.000Z'),
	},
	{
		attendeeCount: 4,
		start: new Date('2024-05-27T12:05:00.000Z'),
		end: undefined,
	},
	{
		attendeeCount: 5,
		start: new Date('2023-08-27T12:05:00.000Z'),
		end: undefined,
	},
];

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminMeetingsPage() {
	return (
		<div className='flex flex-col gap-4'>
			<MeetingsTable columns={columns} data={data} />
		</div>
	);
}
