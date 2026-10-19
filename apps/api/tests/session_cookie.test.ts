import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { AppFactory } from '@adonisjs/core/factories/app';
import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { Emitter } from '@adonisjs/core/events';
import type { ContainerBindings } from '@adonisjs/core/types';
import { defineConfig, Session } from '@adonisjs/session';
import type { ResolvedSessionConfig } from '@adonisjs/session/types';
import SessionCookieMiddleware from '../app/middleware/session_cookie_middleware.ts';

const app = new AppFactory<ContainerBindings>().create(new URL('../', import.meta.url));
const middleware = new SessionCookieMiddleware();

async function context(hostname: string, domain?: string) {
	const config: ResolvedSessionConfig = await defineConfig({
		store: 'memory',
		stores: {},
		cookieName: 'adonis-session',
		cookie: { domain, path: '/', httpOnly: true, sameSite: 'lax' },
	}).resolver(app);
	const ctx = new HttpContextFactory().create();
	mock.method(ctx.request, 'hostname', () => hostname);
	ctx.session = new Session(config, config.stores.memory!, new Emitter(app), ctx);
	await ctx.session.initiate(false);
	return ctx;
}

await test('shared-domain sessions expire the shadowing API-host cookie without clearing the shared cookie', async () => {
	const ctx = await context('api.interval.so.localhost', 'interval.so.localhost');
	let called = false;
	await middleware.handle(ctx, async () => {
		called = true;
		ctx.session.put('authChallenge', true);
	});
	await ctx.session.commit();
	assert.equal(called, true);
	const cookies = ctx.response.getHeader('set-cookie') as string[];
	assert.equal(cookies.length, 2);
	const [expired, shared] = cookies;
	assert.match(expired!, /^adonis-session=;/);
	assert.match(expired!, /Max-Age=0;/);
	assert.doesNotMatch(expired!, /Domain=/);
	assert.match(expired!, /Path=\//);
	assert.match(shared!, /Domain=interval\.so\.localhost/);
	assert.doesNotMatch(shared!, /Max-Age=0;/);
});

await test('host-only sessions and requests to the cookie domain keep their configured cookie', async () => {
	for (const [hostname, domain] of [
		['localhost', undefined],
		['interval.so.localhost', 'interval.so.localhost'],
		['interval.so.localhost', '.interval.so.localhost'],
	] as const) {
		const ctx = await context(hostname, domain);
		await middleware.handle(ctx, async () => {});
		assert.equal(ctx.response.getHeader('set-cookie'), undefined);
	}
});
