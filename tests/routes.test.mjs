import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const sessionSource = await readFile(new URL('../Js/auth/session.js', import.meta.url), 'utf8');
const entrySource = await readFile(new URL('../Js/auth/entry.js', import.meta.url), 'utf8');
const dataModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;

for (const base of ['https://usuario.github.io/', 'https://usuario.github.io/RPG_online/']) {
  test(`entrada, guarda e saída preservam a raiz ${base}`, async (t) => {
    const previousStorage = globalThis.localStorage;
    const previousLocation = globalThis.location;
    t.after(() => {
      globalThis.localStorage = previousStorage;
      globalThis.location = previousLocation;
    });
    const storage = new Map();
    const redirects = [];
    globalThis.localStorage = {
      getItem: (key) => storage.get(key) ?? null,
      removeItem: (key) => storage.delete(key),
    };
    globalThis.location = { replace: (url) => redirects.push(url) };

    // Simula o endereço do módulo publicado para testar a navegação real sem depender da rede.
    const moduleUrl = new URL('Js/auth/session.js', base).href;
    const sessionModule = dataModule(sessionSource.replace('import.meta.url', JSON.stringify(moduleUrl)));
    const session = await import(sessionModule);
    const entryModule = dataModule(entrySource.replace('./session.js', sessionModule));
    const login = `${base}pages/login/`;
    const sheet = `${base}pages/`;
    assert.equal(session.APP_URL.href, base);
    assert.equal(session.LOGIN_URL.href, login);
    assert.equal(session.SHEET_URL.href, sheet);

    await import(`${entryModule}#guest`);
    assert.equal(redirects.pop(), login);
    assert.equal(session.requireSession(), null);
    assert.equal(redirects.pop(), login);

    // Uma sessão válida deve abrir a ficha dentro da mesma subpasta.
    storage.set('oblivio-contas-v1', JSON.stringify([{ id: 'conta-teste', username: 'Viajante' }]));
    storage.set(session.SESSION_KEY, JSON.stringify({ accountId: 'conta-teste', expiresAt: Date.now() + 60000 }));
    await import(`${entryModule}#authenticated`);
    assert.equal(redirects.pop(), sheet);
    assert.equal(session.requireSession().accountId, 'conta-teste');
    session.logout();
    assert.equal(storage.has(session.SESSION_KEY), false);
    assert.equal(redirects.pop(), login);
  });
}
