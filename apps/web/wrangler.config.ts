import { defineWranglerConfig } from 'wrangler/experimental-config';

export default defineWranglerConfig({
	assetsDirectory: './.open-next/assets',
	uploadSourceMaps: true,
	types: { generate: false },
});
