import { defineConfig, drivers } from '@adonisjs/core/hash';

const hashConfig = defineConfig({
	default: 'scrypt',

	list: {
		scrypt: drivers.scrypt({
			cost: 16384,
			blockSize: 8,
			parallelization: 1,
			maxMemory: 33554432,
		}),
	},
});

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default hashConfig;

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
	// biome-ignore lint/correctness/noUndeclaredVariables: This doesn't need to be imported
	export interface HashersList extends InferHashers<typeof hashConfig> {}
}
