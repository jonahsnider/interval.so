import env from '#start/env';

export const rpName = 'hours.frc.sh';

export const rpId = env.get('NODE_ENV') === 'development' ? 'localhost' : 'hours.frc.sh';

export const origin = env.get('NODE_ENV') === 'development' ? 'http://localhost:3000' : 'https://hours.frc.sh';
