import postgres from 'postgres';
import { postgresUrl } from '#config/db';

// Keep lock waiters out of the application's pool: the lock holder still needs a connection to create its session.
const locks = postgres(postgresUrl.release(), { max: 1 });

// Remove with the Adonis session exchange, 90 days after the last old API instance stops issuing account sessions.
export async function withLegacySessionLock<T>(userId: string, callback: () => Promise<T>): Promise<T> {
	const result = await locks.begin(async (tx) => {
		// Serialize exchanges and revocation across API instances, including requests that loaded the same old cookie.
		await tx`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
		return { value: await callback() };
	});
	return result.value;
}
