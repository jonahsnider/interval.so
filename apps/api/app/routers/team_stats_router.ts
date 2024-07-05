import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { AverageHoursDatumSchema } from '../team_stats/schemas/average_hours_datum_schema.js';
import { TimeFilterSchema } from '../team_stats/schemas/time_filter_schema.js';
import { UniqueMembersDatumSchema } from '../team_stats/schemas/unique_members_datum_schema.js';
import { TeamStatsService } from '../team_stats/team_stats_service.js';
import { TeamStatsSubscriptionService } from '../team_stats/team_stats_subscription_service.js';
import { authedProcedure, router } from '../trpc/trpc_service.js';
import { UserService } from '../user/user_service.js';

@inject()
@injectHelper(TeamStatsService, UserService, TeamStatsSubscriptionService)
export class TeamStatsRouter {
	constructor(
		private readonly teamStatsService: TeamStatsService,
		private readonly userService: UserService,
		private readonly teamStatsSubscriptionsService: TeamStatsSubscriptionService,
	) {}

	getRouter() {
		return router({
			getCombinedHours: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
				.output(z.number().nonnegative())
				.query(({ ctx, input }) => {
					return this.teamStatsService.getCombinedHours(ctx.bouncer, input.team, input.timeFilter);
				}),
			getCombinedHoursSubscription: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
				.subscription(({ ctx, input }): Promise<Observable<number, unknown>> => {
					return this.teamStatsSubscriptionsService.combinedHoursSubscribe(ctx.bouncer, input.team, input.timeFilter);
				}),

			uniqueMembers: {
				getTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.output(UniqueMembersDatumSchema.array())
					.query(({ ctx, input }) => {
						const timezone = this.userService.getTimezone(ctx.session);
						return this.teamStatsService.getUniqueMembersTimeSeries(
							ctx.bouncer,
							input.team,
							input.timeFilter,
							timezone,
						);
					}),

				subscribeTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.subscription(({ ctx, input }): Promise<Observable<UniqueMembersDatumSchema[], unknown>> => {
						const timezone = this.userService.getTimezone(ctx.session);
						return this.teamStatsSubscriptionsService.uniqueMembersTimeSeriesSubscribe(
							ctx.bouncer,
							input.team,
							input.timeFilter,
							timezone,
						);
					}),

				getSimple: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.output(z.number().int().nonnegative())
					.query(({ ctx, input }) => {
						return this.teamStatsService.getUniqueMembersSimple(ctx.bouncer, input.team, input.timeFilter);
					}),
			},

			averageHours: {
				getTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.output(AverageHoursDatumSchema.array())
					.query(({ ctx, input }) => {
						const timezone = this.userService.getTimezone(ctx.session);
						return this.teamStatsService.getAverageHoursTimeSeries(ctx.bouncer, input.team, input.timeFilter, timezone);
					}),

				subscribeTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.subscription(({ ctx, input }): Promise<Observable<AverageHoursDatumSchema[], unknown>> => {
						const timezone = this.userService.getTimezone(ctx.session);
						return this.teamStatsSubscriptionsService.averageHoursTimeSeriesSubscribe(
							ctx.bouncer,
							input.team,
							input.timeFilter,
							timezone,
						);
					}),

				getSimple: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeFilter: TimeFilterSchema }).strict())
					.output(z.number().nonnegative())
					.query(({ ctx, input }) => {
						return this.teamStatsService.getAverageHoursSimple(ctx.bouncer, input.team, input.timeFilter);
					}),
			},
		});
	}
}
