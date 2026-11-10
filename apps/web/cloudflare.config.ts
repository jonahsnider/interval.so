import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
	worker: {
		name: 'interval-web',
		entrypoint: './.open-next/worker.js',
		compatibilityDate: '2026-11-09',
		compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
		domains: ['interval.so', 'www.interval.so'],
		workersDev: false,
		assets: { htmlHandling: 'none' },
		env: {
			ASSETS: bindings.assets(),
			IMAGES: bindings.images(),
		},
		observability: {
			enabled: true,
			issues: { enabled: true },
			logs: { enabled: true },
			traces: { enabled: true, headSamplingRate: 0.1 },
		},
	},
});
