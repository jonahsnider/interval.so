'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/src/trpc/trpc-client';
import { formatDate } from '@/src/utils/date-format';
import { ArrowDownTrayIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMeetingSchema } from '@interval.so/api/app/team_meeting/schemas/team_meeting_schema';
import { multiReplace } from '@jonahsnider/util';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import { toTimeFilter } from '../period-select/duration-slug';
import { searchParamParsers } from './search-params';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function DownloadMeetingsCsvButton({ team }: Props) {
	const [searchParams] = useQueryStates(searchParamParsers);
	const timeFilter = useMemo(() => toTimeFilter(searchParams), [searchParams]);

	const { data: meetings } = trpc.teams.meetings.meetingsSubscription.useSubscription({
		team,
		timeFilter,
	});

	const csvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(meetingsToCsv(meetings ?? []))}`;

	return (
		<Button asChild={true} variant='outline'>
			<a download={true} href={csvUrl}>
				<ArrowDownTrayIcon className='h-4 w-4 mr-2' />
				Download CSV
			</a>
		</Button>
	);
}

const CSV_HEADER_SEPARATOR = '-';
const CSV_ROW_SEPARATOR = '';
const TRAILING_SEPARATOR_REGEXP = /(,|,"-")$/gm;

function meetingsToCsv(meetings: TeamMeetingSchema[]) {
	const meetingsToAttendees = meetings.map(
		(meeting) => new Map(meeting.attendees?.map((attendee) => [attendee.member.id, attendee]) ?? []),
	);

	const memberIdToName = new Map(
		meetings.flatMap(
			(meeting) => meeting.attendees?.map((attendee) => [attendee.member.id, attendee.member.name]) ?? [],
		),
	);

	const headerRow = [
		'Name',
		...meetings.flatMap((meeting) => [
			encodeCsvValue(formatDate(meeting.startedAt, true)),
			encodeCsvValue(formatDate(meeting.endedAt ?? new Date(), true)),
			encodeCsvValue(CSV_HEADER_SEPARATOR),
		]),
	].join(',');

	const memberToAttendance = new Map<string, string[]>();

	for (const attendees of meetingsToAttendees.values()) {
		for (const memberId of memberIdToName.keys()) {
			const attendanceForMeeting = attendees.get(memberId);

			const memberAttendance = memberToAttendance.get(memberId);

			const attendanceForMeetingString = [
				attendanceForMeeting ? encodeCsvValue(formatDate(attendanceForMeeting.startedAt, true)) : '',
				attendanceForMeeting ? encodeCsvValue(formatDate(attendanceForMeeting.endedAt ?? new Date(), true)) : '',
				CSV_ROW_SEPARATOR,
			];

			if (memberAttendance) {
				memberAttendance.push(...attendanceForMeetingString);
			} else {
				memberToAttendance.set(memberId, attendanceForMeetingString);
			}
		}
	}

	const memberRows: string[][] = memberToAttendance
		.entries()
		// biome-ignore lint/style/noNonNullAssertion: This is safe
		.map(([memberId, attendance]) => [memberIdToName.get(memberId)!, ...attendance])
		.toArray();

	// biome-ignore lint/style/noNonNullAssertion: This is safe
	memberRows.sort(([a], [b]) => a!.localeCompare(b!));

	const lines = memberRows.map((columns) => columns.join(','));

	return `${headerRow}\n${lines.join('\n')}\n`.replaceAll(TRAILING_SEPARATOR_REGEXP, '');
}

function encodeCsvValue(value: string) {
	if (value === '') {
		return '';
	}

	return `"${multiReplace(value, {
		'"': '\\"',
	})}"`;
}
