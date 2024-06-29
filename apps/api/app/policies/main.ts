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
	// biome-ignore lint/style/useNamingConvention: Convention is to use PascalCase
	TeamMemberPolicy: () => import('./team_member_policy.js'),
	// biome-ignore lint/style/useNamingConvention: Convention is to use PascalCase
	UserPolicy: () => import('./user_policy.js'),
	// biome-ignore lint/style/useNamingConvention: Convention is to use PascalCase
	TeamPolicy: () => import('./team_policy.js'),
	// biome-ignore lint/style/useNamingConvention: Convention is to use PascalCase
	MeetingPolicy: () => import('./meeting_policy.js'),
};
