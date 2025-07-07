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
	TeamMemberPolicy: () => import('./team_member_policy.js'),
	UserPolicy: () => import('./user_policy.js'),
	TeamPolicy: () => import('./team_policy.js'),
	MeetingPolicy: () => import('./meeting_policy.js'),
	TeamMemberAttendancePolicy: () => import('./team_member_attendance_policy.js'),
};
