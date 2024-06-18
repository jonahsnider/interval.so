import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { TeamMemberSchema } from '../team_member/schemas/team_member_schema.js';
import { TeamMemberService } from '../team_member/team_member_service.js';
import { authedProcedure, publicProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(TeamMemberService)
export class TeamMemberRouter {
	constructor(private readonly teamMemberService: TeamMemberService) {}

	getRouter() {
		return router({
			create: publicProcedure
				.input(
					z.object({
						team: TeamSchema.pick({ slug: true }).strict(),
						member: TeamMemberSchema.pick({ name: true }).strict(),
					}),
				)
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamMemberService.create(ctx.context.bouncer, input.team, input.member);
				}),

			updateAttendance: publicProcedure
				.input(TeamMemberSchema.pick({ id: true, atMeeting: true }).strict())
				.output(z.void())
				.mutation(({ input, ctx }) => {
					return this.teamMemberService.updateAttendance(ctx.context.bouncer, input, input);
				}),
			simpleMemberList: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(TeamMemberSchema.pick({ id: true, name: true, atMeeting: true }).array())
				.query(({ ctx, input }) => {
					return this.teamMemberService.getTeamMembersSimple(ctx.context.bouncer, input);
				}),
			endMeeting: authedProcedure
				.input(z.object({ team: TeamSchema.pick({ slug: true }), endTime: z.date() }).strict())
				.output(z.void())
				.mutation(({ ctx, input }) => {
					return this.teamMemberService.signOutAll(ctx.context.bouncer, input.team, input.endTime);
				}),
		});
	}
}
