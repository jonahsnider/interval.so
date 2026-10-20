'use client';

import type { RouterInput, RouterOutput } from './common';
import { useTRPC } from './trpc-client';
import { useLiveQuery } from './use-live-query';

type MembersInput = RouterInput['teams']['members']['simpleMemberList'];
type Members = RouterOutput['teams']['members']['simpleMemberList'];

export function useLiveMembers(team: MembersInput, initialData?: Members) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.members.simpleMemberList.queryOptions(team, { initialData }),
		subscription: trpc.teams.members.simpleMemberListSubscription.subscriptionOptions(team),
	});
}

export function useLiveFullMembers(
	team: MembersInput,
	initialData?: RouterOutput['teams']['members']['fullMemberList'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.members.fullMemberList.queryOptions(team, { initialData }),
		subscription: trpc.teams.members.fullMemberListSubscription.subscriptionOptions(team),
	});
}

export function useLiveMember(
	member: RouterInput['teams']['members']['getMember'],
	initialData?: RouterOutput['teams']['members']['getMember'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.members.getMember.queryOptions(member, { initialData }),
		subscription: trpc.teams.members.getMemberSubscription.subscriptionOptions(member),
	});
}

export function useLiveMeetings(
	input: RouterInput['teams']['meetings']['getMeetings'],
	initialData?: RouterOutput['teams']['meetings']['getMeetings'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.meetings.getMeetings.queryOptions(input, { initialData }),
		subscription: trpc.teams.meetings.meetingsSubscription.subscriptionOptions(input),
	});
}

export function useLiveMeetingStart(
	team: MembersInput,
	initialData: RouterOutput['teams']['meetings']['getCurrentMeetingStart'],
) {
	const trpc = useTRPC();
	const subscription = trpc.teams.meetings.currentMeetingStartSubscription.subscriptionOptions(team);
	return useLiveQuery({
		query: trpc.teams.meetings.getCurrentMeetingStart.queryOptions(team, { initialData }),
		subscription: {
			...subscription,
			subscribe: (observer) =>
				subscription.subscribe({
					...observer,
					onData: (startedAt) => observer.onData({ startedAt }),
				}),
		},
	});
}

export function useLiveCombinedHours(input: RouterInput['teams']['stats']['getCombinedHours'], initialData?: number) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.stats.getCombinedHours.queryOptions(input, { initialData }),
		subscription: trpc.teams.stats.getCombinedHoursSubscription.subscriptionOptions(input),
	});
}

export function useLiveAverageHours(
	input: RouterInput['teams']['stats']['averageHours']['getTimeSeries'],
	initialData?: RouterOutput['teams']['stats']['averageHours']['getTimeSeries'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.stats.averageHours.getTimeSeries.queryOptions(input, { initialData }),
		subscription: trpc.teams.stats.averageHours.subscribeTimeSeries.subscriptionOptions(input),
	});
}

export function useLiveUniqueMembers(
	input: RouterInput['teams']['stats']['uniqueMembers']['getTimeSeries'],
	initialData?: RouterOutput['teams']['stats']['uniqueMembers']['getTimeSeries'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.stats.uniqueMembers.getTimeSeries.queryOptions(input, { initialData }),
		subscription: trpc.teams.stats.uniqueMembers.subscribeTimeSeries.subscriptionOptions(input),
	});
}

export function useLiveAttendance(
	input: RouterInput['teams']['members']['attendance']['getEntriesForMember'],
	initialData?: RouterOutput['teams']['members']['attendance']['getEntriesForMember'],
) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: trpc.teams.members.attendance.getEntriesForMember.queryOptions(input, { initialData }),
		subscription: trpc.teams.members.attendance.entriesForMemberSubscription.subscriptionOptions(input),
	});
}
