import { inject } from '@adonisjs/core';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/types';
import typia, { type tags } from 'typia';
import type { AuthChallengeService } from '#services/auth_challenge_service';
import { AuthService } from '#services/auth_service';
import { publicProcedure, router } from '#services/trpc_service';
import { injectHelper } from '../../util/inject_helper.js';

@inject()
@injectHelper(AuthService)
export class AuthRouter {
	constructor(
		private readonly authService: AuthService,
		private readonly authChallengeService: AuthChallengeService,
	) {}

	getRouter() {
		return router({
			register: router({
				generateRegistrationOptions: publicProcedure
					.input(
						typia.createAssert<{
							displayName: string & tags.MaxLength<128>;
						}>(),
					)
					.output(typia.createAssert<PublicKeyCredentialCreationOptionsJSON>())
					.mutation(async ({ input, ctx }) => {
						const sessionId = this.authChallengeService.getSessionId(ctx.context);

						const options = await this.authService.getRegisterOptions({
							displayName: input.displayName,
							sessionId,
						});
						return options;
					}),
				verifyRegistrationResponse: publicProcedure
					.input(
						typia.createAssert<{
							body: RegistrationResponseJSON;
							displayName: string;
						}>(),
					)
					.output(typia.createAssert<boolean>())
					.mutation(async ({ input, ctx }) => {
						const session = this.authChallengeService.getSessionId(ctx.context);
						const verified = await this.authService.verifyRegister({
							body: input.body,
							displayName: input.displayName,
							sessionId: session,
						});

						return verified;
					}),
			}),
			login: router({
				generateAuthenticationOptions: publicProcedure
					.output(typia.createAssert<PublicKeyCredentialRequestOptionsJSON>())
					.mutation(({ ctx }) => {
						const sessionId = this.authChallengeService.getSessionId(ctx.context);
						return this.authService.getLoginOptions(sessionId);
					}),
				verifyAuthenticationResponse: publicProcedure
					.input(typia.createAssert<{ body: AuthenticationResponseJSON }>())
					.mutation(({ input, ctx }) => {
						const sessionId = this.authChallengeService.getSessionId(ctx.context);

						return this.authService.verifyLogin(input.body, sessionId);
					}),
			}),
		});
	}
}
