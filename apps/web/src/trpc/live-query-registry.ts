import { hashKey, type QueryClient, type QueryKey } from '@tanstack/react-query';

type LiveError = { message: string };

export type LiveConnection = {
	status: 'idle' | 'connecting' | 'pending' | 'error';
	error: LiveError | null;
};

export type LiveSubscription<T> = {
	queryKey: QueryKey;
	enabled: boolean;
	subscribe: (observer: {
		onData: (data: T) => void;
		onStarted: () => void;
		onError: (error: LiveError) => void;
		onConnectionStateChange: (state: { state: 'idle' | 'connecting' | 'pending'; error: LiveError | null }) => void;
	}) => { unsubscribe: () => void };
};

export const idleConnection: LiveConnection = { status: 'idle', error: null };
export const connectingConnection: LiveConnection = { status: 'connecting', error: null };

type Entry = {
	listeners: Set<() => void>;
	connection: LiveConnection;
	unsubscribe: () => void;
};

export class LiveQueryRegistry {
	private readonly entries = new Map<string, Entry>();

	private readonly queryClient: QueryClient;

	constructor(queryClient: QueryClient) {
		this.queryClient = queryClient;
	}

	getConnection(key: string): LiveConnection {
		return this.entries.get(key)?.connection ?? connectingConnection;
	}

	subscribe<T>(subscription: LiveSubscription<T>, queryKey: QueryKey, listener: () => void): () => void {
		const key = hashKey(subscription.queryKey);
		let entry = this.entries.get(key);
		if (!entry) {
			entry = { listeners: new Set(), connection: connectingConnection, unsubscribe: () => {} };
			this.entries.set(key, entry);
			const currentEntry = entry;
			const isCurrent = () => this.entries.get(key) === currentEntry;
			const updateConnection = (connection: LiveConnection) => {
				if (!isCurrent()) return;
				if (currentEntry.connection.status === connection.status && currentEntry.connection.error === connection.error)
					return;
				currentEntry.connection = connection;
				for (const notify of currentEntry.listeners) notify();
			};
			const source = subscription.subscribe({
				onData: (data) => {
					if (!isCurrent()) return;
					this.queryClient.setQueryData(queryKey, data);
					updateConnection({ status: 'pending', error: null });
				},
				onStarted: () => updateConnection({ status: 'pending', error: null }),
				onError: (error) => updateConnection({ status: 'error', error }),
				onConnectionStateChange: ({ state, error }) => updateConnection({ status: state, error }),
			});
			entry.unsubscribe = () => source.unsubscribe();
		}
		entry.listeners.add(listener);

		return () => {
			entry.listeners.delete(listener);
			if (entry.listeners.size === 0 && this.entries.get(key) === entry) {
				this.entries.delete(key);
				entry.unsubscribe();
			}
		};
	}

	clear(): void {
		const entries = [...this.entries.values()];
		this.entries.clear();
		for (const entry of entries) entry.unsubscribe();
	}
}
