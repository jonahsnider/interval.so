import env from '#start/env';

export const rpName = 'interval.so';

function getDevelopmentWebUrl() {
	const portlessUrl = env.get('PORTLESS_URL');

	if (!portlessUrl) {
		return new URL('http://localhost:3000');
	}

	const url = new URL(portlessUrl);
	const hostname = url.hostname.split('.');
	const projectNameIndex = hostname.lastIndexOf('interval');

	if (projectNameIndex < 1 || hostname[projectNameIndex - 1] !== 'api') {
		throw new Error(`Unable to derive the web URL from ${portlessUrl}`);
	}

	hostname.splice(projectNameIndex - 1, 1);
	url.hostname = hostname.join('.');

	return url;
}

const developmentWebUrl = getDevelopmentWebUrl();

export const rpId = env.get('NODE_ENV') === 'development' ? developmentWebUrl.hostname : 'interval.so';

export const origin = env.get('NODE_ENV') === 'development' ? developmentWebUrl.origin : 'https://interval.so';
