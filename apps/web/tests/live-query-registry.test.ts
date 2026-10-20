import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { LiveQueryContext, useLiveQuery } from '../src/trpc/use-live-query.ts';
import { hashKey, QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { LiveQueryRegistry, type LiveSubscription } from '../src/trpc/live-query-registry.ts';

function setup() {
	const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
	return { client, registry: new LiveQueryRegistry(client) };
}

function source<T>(input = { team: 'one', start: new Date('2026-10-01') }) {
	const observers: Parameters<LiveSubscription<T>['subscribe']>[0][] = [];
	let stopped = 0;
	const subscription: LiveSubscription<T> = {
		queryKey: ['membersSubscription', input],
		enabled: true,
		subscribe(observer) {
			observers.push(observer);
			return {
				unsubscribe: () => {
					stopped++;
				},
			};
		},
	};
	return {
		subscription,
		observers,
		get stopped() {
			return stopped;
		},
	};
}

const queryKey = ['members', { team: 'one' }];

await test('shares a stream, updates query observers, and stops only after the last consumer leaves', () => {
	const { client, registry } = setup();
	type Members = { name: string; signedInAt: Date }[];
	const stream = source<Members>();
	const query = new QueryObserver<Members>(client, { queryKey, enabled: false, structuralSharing: false });
	const updates: unknown[] = [];
	const stopQuery = query.subscribe((result) => updates.push(result.data));
	const first = registry.subscribe(stream.subscription, queryKey, () => {});
	const second = registry.subscribe(stream.subscription, queryKey, () => {});
	assert.equal(stream.observers.length, 1);

	const snapshot = [{ name: 'Ada', signedInAt: new Date('2026-10-19T12:00:00Z') }];
	stream.observers[0]!.onData(snapshot);
	assert.equal(client.getQueryData(queryKey), snapshot);
	assert.equal(query.getCurrentResult().data, snapshot);
	assert.ok(updates.includes(snapshot));
	assert.ok(query.getCurrentResult().data?.[0]?.signedInAt instanceof Date);

	first();
	assert.equal(stream.stopped, 0);
	stream.observers[0]!.onData([]);
	assert.deepEqual(query.getCurrentResult().data, []);
	second();
	assert.equal(stream.stopped, 1);
	assert.deepEqual(client.getQueryData(queryKey), []);
	stopQuery();
	client.clear();
});

await test('equivalent Date inputs share a stream; different teams or filters do not', () => {
	const { client, registry } = setup();
	const stream = source<number>();
	const equivalent = source<number>();
	const otherTeam = source<number>({ team: 'two', start: new Date('2026-10-01') });
	const otherFilter = source<number>({ team: 'one', start: new Date('2026-10-02') });
	const stops = [
		registry.subscribe(stream.subscription, queryKey, () => {}),
		registry.subscribe(equivalent.subscription, queryKey, () => {}),
		registry.subscribe(otherTeam.subscription, ['otherTeam'], () => {}),
		registry.subscribe(otherFilter.subscription, ['otherFilter'], () => {}),
	];
	assert.equal(stream.observers.length, 1);
	assert.equal(equivalent.observers.length, 0);
	assert.equal(otherTeam.observers.length, 1);
	assert.equal(otherFilter.observers.length, 1);
	otherFilter.observers[0]!.onData(2);
	assert.equal(client.getQueryData(queryKey), undefined);
	assert.equal(client.getQueryData(['otherFilter']), 2);
	for (const stop of stops) stop();
	client.clear();
});

await test('obsolete callbacks cannot overwrite a remounted subscription or resurrect cleared data', () => {
	const { client, registry } = setup();
	const stream = source<number>();
	const stop = registry.subscribe(stream.subscription, queryKey, () => {});
	stream.observers[0]!.onData(1);
	stop();
	const stopAgain = registry.subscribe(stream.subscription, queryKey, () => {});
	stream.observers[1]!.onData(2);
	stream.observers[0]!.onData(0);
	assert.equal(client.getQueryData(queryKey), 2);

	registry.clear();
	client.clear();
	stream.observers[1]!.onData(3);
	stream.observers[1]!.onError(new Error('Old session'));
	assert.equal(client.getQueryData(queryKey), undefined);
	assert.equal(stream.stopped, 2);
	stopAgain();
	assert.equal(stream.stopped, 2);
});

await test('shares connection errors and preserves data while reconnecting', () => {
	const { client, registry } = setup();
	const stream = source<number>();
	let notified = 0;
	const stop = registry.subscribe(stream.subscription, queryKey, () => {
		notified++;
	});
	const observer = stream.observers[0]!;
	const key = hashKey(stream.subscription.queryKey);
	assert.equal(registry.getConnection(key).status, 'connecting');
	observer.onStarted();
	observer.onData(0);
	assert.equal(registry.getConnection(key).status, 'pending');
	assert.equal(notified, 1);
	const error = new Error('Disconnected');
	observer.onConnectionStateChange({ state: 'connecting', error });
	assert.deepEqual(registry.getConnection(key), { status: 'connecting', error });
	assert.equal(client.getQueryData(queryKey), 0);
	observer.onError(error);
	assert.deepEqual(registry.getConnection(key), { status: 'error', error });
	observer.onStarted();
	observer.onData(1);
	assert.deepEqual(registry.getConnection(key), { status: 'pending', error: null });
	assert.equal(client.getQueryData(queryKey), 1);
	stop();
	client.clear();
});

await test('accepts synchronous snapshots and caches an absent meeting inside an object', () => {
	const { client, registry } = setup();
	const subscription: LiveSubscription<{ startedAt?: Date }> = {
		queryKey: ['meetingStartSubscription'],
		enabled: true,
		subscribe(observer) {
			observer.onData({ startedAt: undefined });
			return { unsubscribe: () => {} };
		},
	};
	client.setQueryData(queryKey, { startedAt: new Date() });
	const stop = registry.subscribe(subscription, queryKey, () => {});
	assert.deepEqual(client.getQueryData(queryKey), { startedAt: undefined });
	assert.equal(client.getQueryState(queryKey)?.status, 'success');
	stop();
	client.clear();
});

await test('server rendering uses initial or cached data without opening subscriptions and isolates requests', () => {
	const stream = source<number>();
	function Consumer() {
		const { data, connectionStatus } = useLiveQuery({
			query: { queryKey, initialData: 1 },
			subscription: stream.subscription,
		});
		return createElement('span', null, `${data}:${connectionStatus}`);
	}
	function render(client: QueryClient, registry: LiveQueryRegistry) {
		return renderToString(
			createElement(
				QueryClientProvider,
				{ client },
				createElement(LiveQueryContext, { value: registry }, createElement(Consumer)),
			),
		);
	}
	const firstRequest = setup();
	firstRequest.client.setQueryData(queryKey, 2);
	assert.equal(render(firstRequest.client, firstRequest.registry), '<span>2:connecting</span>');
	const secondRequest = setup();
	assert.equal(render(secondRequest.client, secondRequest.registry), '<span>1:connecting</span>');
	assert.equal(stream.observers.length, 0);
	firstRequest.client.clear();
	secondRequest.client.clear();
});
