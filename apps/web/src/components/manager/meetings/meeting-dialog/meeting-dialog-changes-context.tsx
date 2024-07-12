import type { MeetingAttendeeSchema } from '@hours.frc.sh/api/app/team_meeting/schemas/team_meeting_schema';
import { createContext, useMemo } from 'react';
import { useMutative } from 'use-mutative';

export type MeetingChange = Partial<Pick<MeetingAttendeeSchema, 'startedAt'> | Pick<MeetingAttendeeSchema, 'endedAt'>>;

export type MeetingChangeMap = {
	meetings: Record<MeetingAttendeeSchema['attendanceId'], Pick<MeetingAttendeeSchema, 'startedAt' | 'endedAt'>>;
};

type ContextValue = {
	updatedMeetings: MeetingChangeMap;
	updateMeeting: (
		meeting: Pick<MeetingAttendeeSchema, 'attendanceId' | 'startedAt' | 'endedAt'>,
		data: MeetingChange,
	) => void;
	clearUpdatedMeetings: () => void;
};

export const MeetingDialogChangesContext = createContext<ContextValue>({
	updatedMeetings: { meetings: {} },
	updateMeeting: () => {},
	clearUpdatedMeetings: () => {},
});

export function MeetingDialogChangesProvider({ children }: { children: React.ReactNode }) {
	const [updatedMeetings, setUpdatedMeetings] = useMutative<MeetingChangeMap>({ meetings: {} });

	const updateMeeting = useMemo(
		() => (original: Pick<MeetingAttendeeSchema, 'attendanceId' | 'startedAt' | 'endedAt'>, data: MeetingChange) => {
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: No obvious way to simplify this
			setUpdatedMeetings((draft) => {
				draft.meetings[original.attendanceId] ??= {
					startedAt: original.startedAt,
					endedAt: original.endedAt,
				};
				const entry = draft.meetings[original.attendanceId];

				if (!entry) {
					throw new TypeError('Expected entry to be defined');
				}

				if ('startedAt' in data) {
					entry.startedAt = data.startedAt ?? original.startedAt;
				}

				if ('endedAt' in data) {
					entry.endedAt = data.endedAt ?? original.endedAt;
				}

				if (
					entry.startedAt.getTime() === original.startedAt.getTime() &&
					entry.endedAt.getTime() === original.endedAt.getTime()
				) {
					// Nothing has changed, remove the entry from the draft
					delete draft.meetings[original.attendanceId];
				}
			});
		},
		[setUpdatedMeetings],
	);

	const clearUpdatedMeetings = useMemo(
		() => () => {
			setUpdatedMeetings((draft) => {
				draft.meetings = {};
			});
		},
		[setUpdatedMeetings],
	);

	const contextValue: ContextValue = useMemo(
		() => ({ updatedMeetings, updateMeeting, clearUpdatedMeetings }),
		[updatedMeetings, updateMeeting, clearUpdatedMeetings],
	);

	return <MeetingDialogChangesContext.Provider value={contextValue}>{children}</MeetingDialogChangesContext.Provider>;
}
