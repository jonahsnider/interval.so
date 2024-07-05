import type { Session } from '@adonisjs/session';
import type { AppBouncer } from '#middleware/initialize_bouncer_middleware';
import type { CreateAdonisContextOptions } from './trpc_adonis_adapter.js';

type TrpcContext = { bouncer: AppBouncer; session: Session };

export function createHttpContext({ context }: CreateAdonisContextOptions): TrpcContext {
	return { bouncer: context.bouncer, session: context.session };
}
