import { inject } from '@adonisjs/core';
import { z } from 'zod';
import { injectHelper } from '../../util/inject_helper.js';
import { GuestPasswordService } from '../guest_password/guest_password_service.js';
import { TeamSchema } from '../team/schemas/team_schema.js';
import { publicProcedure, router } from '../trpc/trpc_service.js';

@inject()
@injectHelper(GuestPasswordService)
export class GuestRouter {
	constructor(private readonly guestPasswordService: GuestPasswordService) {}

	getRouter() {
		return router({
			isGuest: publicProcedure
				.input(TeamSchema.pick({ slug: true }))
				.output(z.boolean())
				.query(({ ctx, input }) => {
					if (!ctx.guestToken) {
						return false;
					}

					return this.guestPasswordService.teamHasGuestToken(input, ctx.guestToken);
				}),
			passwordLogin: publicProcedure
				.input(TeamSchema.pick({ password: true, slug: true }))
				.mutation(async ({ ctx, input }) => {
					await this.guestPasswordService.guestPasswordLogin(input, ctx.context);
				}),
			getCurrentGuestTeam: publicProcedure.output(TeamSchema.pick({ slug: true }).optional()).query(({ ctx }) => {
				if (!ctx.guestToken) {
					return undefined;
				}

				return this.guestPasswordService.getTeamFromToken(ctx.guestToken);
			}),
		});
	}
}
