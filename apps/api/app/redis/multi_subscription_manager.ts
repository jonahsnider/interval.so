import logger from '@adonisjs/core/services/logger';
import redis from '@adonisjs/redis/services/main';
import { Observable, share } from 'rxjs';

export class MultiSubscriptionManager {
	private static readonly subscriptions = new Map<string, Observable<string>>();

	static subscribe<T extends string>(channel: string): Observable<T> {
		const existingObservable = MultiSubscriptionManager.subscriptions.get(channel);

		if (existingObservable) {
			return existingObservable as Observable<T>;
		}

		const observable = new Observable<T>((observer) => {
			redis.subscribe(channel, (data) => {
				observer.next(data as T);
			});

			return () => {
				redis.unsubscribe(channel).catch((error) => {
					logger.error(`Redis unsubscribe error for channel ${channel}`, error);
					observer.error(error);
				});
				MultiSubscriptionManager.subscriptions.delete(channel);
			};
		}).pipe(share());

		MultiSubscriptionManager.subscriptions.set(channel, observable);

		return observable;
	}
}
