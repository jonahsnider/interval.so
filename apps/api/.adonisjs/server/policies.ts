export const policies = {
  MainPolicy: () => import('#policies/main'),
  MeetingPolicy: () => import('#policies/meeting_policy'),
  TeamMemberAttendancePolicy: () => import('#policies/team_member_attendance_policy'),
  TeamMemberPolicy: () => import('#policies/team_member_policy'),
  TeamPolicy: () => import('#policies/team_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}

