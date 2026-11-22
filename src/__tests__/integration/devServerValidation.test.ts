// @vitest-environment node
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('local chat validation', () => {
  let server: ChildProcess;
  let baseUrl: string;

  beforeAll(async () => {
    const stub = 'globalThis.fetch = async () => Response.json({ candidates: [{ content: { parts: [{ text: "Test title" }] } }] });';
    server = spawn(process.execPath, [
      '--import', `data:text/javascript,${encodeURIComponent(stub)}`,
      'api/dev-server.mjs',
    ], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    baseUrl = await new Promise<string>((resolve, reject) => {
      let output = '';
      server.stdout!.on('data', (chunk: Buffer) => {
        output += chunk.toString();
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match) resolve(match[0]);
      });
      server.on('error', reject);
      server.on('exit', (code) => reject(new Error(`Dev server exited: ${code}`)));
    });
  });

  afterAll(async () => {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  });

  async function post(body: string) {
    return fetch(`${baseUrl}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
  }

  it('forwards a valid title request', async () => {
    const response = await post(JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }], task: 'title' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ title: 'Test title' });
  });

  it.each([
    ['invalid JSON', '{'],
    ['missing messages', '{}'],
    ['empty messages', JSON.stringify({ messages: [] })],
    ['empty content', JSON.stringify({ messages: [{ role: 'user', content: '' }] })],
    ['invalid role', JSON.stringify({ messages: [{ role: 'invalid', content: 'Hola' }] })],
    ['oversized content', JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(10001) }] })],
    ['too many messages', JSON.stringify({ messages: Array.from({ length: 101 }, () => ({ role: 'user', content: 'Hola' })) })],
    ['oversized system prompt', JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }], systemPrompt: 'x'.repeat(20001) })],
  ])('rejects %s before contacting the model', async (_, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  });
});
