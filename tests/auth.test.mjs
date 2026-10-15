import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { authenticate, getSession, logout, requireSession, LOGIN_URL, SESSION_KEY } from '../Js/auth/session.js';

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

test('cadastro, autenticação, expiração e falhas de armazenamento', async () => {
  const storage = new MemoryStorage();
  globalThis.localStorage = storage;
  if (!globalThis.crypto) globalThis.crypto = webcrypto;
  const redirects = [];
  globalThis.location = { replace: (url) => redirects.push(url) };
  assert.equal(getSession(), null);
  assert.equal(requireSession(), null);
  assert.equal(redirects.at(-1), LOGIN_URL.href);

  // A entrada de uma conta não pode apagar fichas anteriores à autenticação.
  storage.setItem('oblivio-fichas-v1', '{"antiga":{"name":"Persona antiga"}}');
  const first = await authenticate('Viajante', 'senha-local-123', true);
  assert.equal(first.username, 'Viajante');
  assert.equal(first.ownsLegacySheets, true);
  assert.equal(storage.getItem('oblivio-fichas-v1'), '{"antiga":{"name":"Persona antiga"}}');
  assert.equal(storage.getItem('oblivio-contas-v1').includes('senha-local-123'), false);
  assert.equal(JSON.parse(storage.getItem('oblivio-contas-v1'))[0].verifier.length, 64);
  logout();
  assert.equal(getSession(), null);
  await assert.rejects(authenticate('Viajante', 'senha-incorreta'), /Usuário ou senha incorretos/);
  assert.equal(getSession(), null);
  assert.equal((await authenticate(' viajante ', 'senha-local-123')).accountId, first.accountId);
  await assert.rejects(authenticate('VIAJANTE', 'outra-senha', true), /já existe/);

  const second = await authenticate('Guardiao', 'senha-local-456', true);
  assert.notEqual(second.accountId, first.accountId);
  assert.equal(second.ownsLegacySheets, false);
  storage.setItem(SESSION_KEY, JSON.stringify({ accountId: second.accountId, expiresAt: Date.now() - 1 }));
  assert.equal(getSession(), null);
  storage.setItem(SESSION_KEY, JSON.stringify({ accountId: 'inexistente', expiresAt: Date.now() + 10000 }));
  assert.equal(getSession(), null);
  storage.setItem(SESSION_KEY, '{inválido');
  assert.equal(getSession(), null);
  await assert.rejects(authenticate('ab', 'senha-local-123', true), /3 a 32/);
  await assert.rejects(authenticate('Nome', 'curta', true), /8 e 128/);

  storage.setItem = () => { throw new DOMException('Armazenamento indisponível', 'QuotaExceededError'); };
  await assert.rejects(authenticate('Viajante', 'senha-local-123'), { name: 'QuotaExceededError' });
  assert.equal(getSession(), null);
  globalThis.localStorage = { getItem() { throw new Error('Bloqueado'); } };
  assert.equal(getSession(), null);
});
