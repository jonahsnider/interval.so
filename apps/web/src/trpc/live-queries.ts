'use client';

import { fromHandle, type inferQueryHandle } from '@trpc/tanstack-react-query/unstable-handles';
import type { RouterInput, RouterOutput } from './common';
import { type TRPC, useTRPC } from './trpc-client';
import { useLiveQuery } from './use-live-query';

type MembersInput = RouterInput['teams']['members']['simpleMemberList'];
export type MembersHandle = inferQueryHandle<TRPC['teams']['members']['simpleMemberList']>;
export type FullMembersHandle = inferQueryHandle<TRPC['teams']['members']['fullMemberList']>;
export type MemberHandle = inferQueryHandle<TRPC['teams']['members']['getMember']>;
export type MeetingStartHandle = inferQueryHandle<TRPC['teams']['meetings']['getCurrentMeetingStart']>;

export function useLiveMembers(team: MembersInput | MembersHandle) {
	const trpc = useTRPC();
	const isHandle = 'queryKey' in team;
	const query = isHandle ? fromHandle(trpc, team) : trpc.teams.members.simpleMemberList.queryOptions(team);
	return useLiveQuery({
		query,
		subscription: trpc.teams.members.simpleMemberListSubscription.subscriptionOptions(isHandle ? team.input : team),
	});
}

export function useLiveFullMembers(handle: FullMembersHandle) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: fromHandle(trpc, handle),
		subscription: trpc.teams.members.fullMemberListSubscription.subscriptionOptions(handle.input),
	});
}

export function useLiveMember(handle: MemberHandle) {
	const trpc = useTRPC();
	return useLiveQuery({
		query: fromHandle(trpc, handle),
		subscription: trpc.teams.members.getMemberSubscription.subscriptionOptions(handle.input),
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

export function useLiveMeetingStart(handle: MeetingStartHandle) {
	const trpc = useTRPC();
	const subscription = trpc.teams.meetings.currentMeetingStartSubscription.subscriptionOptions(handle.input);
	return useLiveQuery({
		query: fromHandle(trpc, handle),
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
