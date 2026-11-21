import { createPool } from 'drizzle-orm/postgres';
import { postgresUrl } from '#config/db';

// Keep lock waiters out of the application's pool: the lock holder still needs a connection to create its session.
const locks = createPool({ url: postgresUrl.release(), max: 1 });

// Remove with the Adonis session exchange, 90 days after the last old API instance stops issuing account sessions.
export async function withLegacySessionLock<T>(userId: string, callback: () => Promise<T>): Promise<T> {
	return locks.transaction(async (tx) => {
		// Serialize exchanges and revocation across API instances, including requests that loaded the same old cookie.
		await tx.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [userId]);
		return callback();
	});
}
