import { inject } from '@adonisjs/core';
import type { Observable } from '@trpc/server/observable';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { AverageHoursDatumSchema } from '../team_stats/schemas/average_hours_datum_schema.js';
import { TimeRangeSchema } from '../team_stats/schemas/time_range_schema.js';
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
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
				.output(z.number().nonnegative())
				.query(({ ctx, input }) => {
					return this.teamStatsService.getCombinedHours(ctx.context.bouncer, input.team, input.timeRange);
				}),
			getCombinedHoursSubscription: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
				.subscription(({ ctx, input }): Promise<Observable<number, unknown>> => {
					return this.teamStatsSubscriptionsService.combinedHoursSubscribe(
						ctx.context.bouncer,
						input.team,
						input.timeRange,
					);
				}),

			uniqueMembers: {
				getTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.output(UniqueMembersDatumSchema.array())
					.query(({ ctx, input }) => {
						const timezone = this.userService.getTimezone(ctx.context);
						return this.teamStatsService.getUniqueMembersTimeSeries(
							ctx.context.bouncer,
							input.team,
							input.timeRange,
							timezone,
						);
					}),

				subscribeTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.subscription(({ ctx, input }): Promise<Observable<UniqueMembersDatumSchema[], unknown>> => {
						const timezone = this.userService.getTimezone(ctx.context);
						return this.teamStatsSubscriptionsService.uniqueMembersTimeSeriesSubscribe(
							ctx.context.bouncer,
							input.team,
							input.timeRange,
							timezone,
						);
					}),

				getSimple: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.output(z.number().int().nonnegative())
					.query(({ ctx, input }) => {
						return this.teamStatsService.getUniqueMembersSimple(ctx.context.bouncer, input.team, input.timeRange);
					}),
			},

			averageHours: {
				getTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.output(AverageHoursDatumSchema.array())
					.query(({ ctx, input }) => {
						const timezone = this.userService.getTimezone(ctx.context);
						return this.teamStatsService.getAverageHoursTimeSeries(
							ctx.context.bouncer,
							input.team,
							input.timeRange,
							timezone,
						);
					}),

				subscribeTimeSeries: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.subscription(({ ctx, input }): Promise<Observable<AverageHoursDatumSchema[], unknown>> => {
						const timezone = this.userService.getTimezone(ctx.context);
						return this.teamStatsSubscriptionsService.averageHoursTimeSeriesSubscribe(
							ctx.context.bouncer,
							input.team,
							input.timeRange,
							timezone,
						);
					}),

				getSimple: authedProcedure
					.input(z.object({ team: TeamSchema.pick({ slug: true }), timeRange: TimeRangeSchema }).strict())
					.output(z.number().nonnegative())
					.query(({ ctx, input }) => {
						return this.teamStatsService.getAverageHoursSimple(ctx.context.bouncer, input.team, input.timeRange);
					}),
			},
		});
	}
}
