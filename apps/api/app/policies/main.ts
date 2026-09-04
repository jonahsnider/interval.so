/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
	TeamMemberPolicy: () => import('./team_member_policy.ts'),
	UserPolicy: () => import('./user_policy.ts'),
	TeamPolicy: () => import('./team_policy.ts'),
	MeetingPolicy: () => import('./meeting_policy.ts'),
	TeamMemberAttendancePolicy: () => import('./team_member_attendance_policy.ts'),
};
