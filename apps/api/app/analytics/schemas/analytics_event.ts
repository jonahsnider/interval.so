/** Event IDs used for PostHog. These should map to end-user actions, not internal or implementation-specific actions. */
export enum AnalyticsEvent {
	UserSignedUp = 'user_signed_up',
	UserLoggedIn = 'user_logged_in',
	UserNameChanged = 'user_name_changed',
	UserDeleted = 'user_deleted',

	TeamCreated = 'team_created',
	TeamDeleted = 'team_deleted',

	/** One team member had their attendance signed in. */
	TeamMemberSignedIn = 'team_member_signed_in',
	/** One team member had their attendance signed out. */
	TeamMemberSignedOut = 'team_member_signed_out',
	TeamMemberCreated = 'team_member_created',
	TeamMemberDeleted = 'team_member_deleted',
	TeamMemberArchivedUpdated = 'team_member_archived_updated',
	TeamMemberNameUpdated = 'team_member_name_updated',

	TeamMembersBatchDeleted = 'team_members_batch_deleted',
	TeamMembersBatchArchivedUpdated = 'team_members_batch_archived_updated',
	TeamMembersBatchSignedIn = 'team_members_batch_signed_in',
	TeamMembersBatchSignedOut = 'team_members_batch_signed_out',

	/** A member attendance entry was updated. */
	TeamMemberAttendanceUpdated = 'team_member_attendance_updated',
	/** One member attendance entry was deleted. */
	TeamMemberAttendanceDeleted = 'team_member_attendance_deleted',
	/** Many member attendance entries were deleted. */
	TeamMemberAttendanceBatchDeleted = 'team_member_attendance_batch_deleted',
	TeamMemberAttendanceCreated = 'team_member_attendance_created',
	TeamMemberAttendanceMerged = 'team_member_attendance_merged',

	MeetingCreated = 'meeting_created',
	MeetingDeleted = 'meeting_deleted',
	/** The "End meeting" button was used. */
	MeetingEnded = 'meeting_ended',
}
