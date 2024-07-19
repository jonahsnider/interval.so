import env from '#start/env';

export const rpName = 'interval.so';

export const rpId = env.get('NODE_ENV') === 'development' ? 'localhost' : 'interval.so';

export const origin = env.get('NODE_ENV') === 'development' ? 'http://localhost:3000' : 'https://interval.so';
