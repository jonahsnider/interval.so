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
}
