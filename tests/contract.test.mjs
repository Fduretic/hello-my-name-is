import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

test('Compose obeys the single static service deployment contract', () => {
  const compose = parse(readFileSync('compose.yaml', 'utf8'));
  const allowedTop = new Set(['services', 'volumes', 'name', 'version']);
  const allowedService = new Set(['image', 'build', 'command', 'entrypoint', 'working_dir', 'environment', 'depends_on', 'healthcheck', 'restart', 'init', 'read_only', 'tmpfs', 'user', 'volumes', 'stop_grace_period', 'expose']);
  assert.ok(Object.keys(compose).every(key => allowedTop.has(key)));
  assert.deepEqual(Object.keys(compose.services), ['web']);
  const web = compose.services.web;
  assert.ok(Object.keys(web).every(key => allowedService.has(key)));
  assert.deepEqual(web.expose, ['80']);
  assert.equal(web.build.context, '.');
  assert.equal(web.build.dockerfile, 'Dockerfile');
  assert.equal(web.build.args.PUBLIC_DISPLAY_NAME, '${PUBLIC_DISPLAY_NAME:-YOUR NAME}');
  assert.ok(web.healthcheck.test.includes('http://127.0.0.1:80/health'));
});
test('manifest preserves provided properties and static architecture', () => {
  const manifest = parse(readFileSync('vps-admin.yaml', 'utf8'));
  assert.deepEqual(Object.keys(manifest).sort(), ['version', 'compose', 'public', 'routing', 'services', 'technologies', 'environment', 'storage', 'schedules'].sort());
  assert.deepEqual(manifest.public, { service: 'web', port: 80 });
  assert.deepEqual(manifest.routing, { pathPrefix: false });
  for (const key of ['services', 'environment', 'storage', 'schedules']) assert.deepEqual(manifest[key], []);
});
