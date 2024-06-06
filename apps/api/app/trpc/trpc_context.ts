import type { HttpContext } from '@adonisjs/core/http';
import type { CreateAdonisContextOptions } from './trpc_adonis_adapter.js';

type TrpcContext = { context: HttpContext };

export function createContext({ context }: CreateAdonisContextOptions): TrpcContext {
	return { context };
}
