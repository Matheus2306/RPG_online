import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { sheetComponents } from '../Js/core/sheet-page.js';
import { card } from '../Js/ui/components/card.js';
import { disclosure } from '../Js/ui/components/disclosure.js';
import { tabs } from '../Js/ui/components/tabs.js';

const html = sheetComponents.map(({ render }) => render()).join('');

test('composição preserva os controles necessários à inicialização e não duplica IDs', async () => {
  const page = await readFile(new URL('../pages/index.html', import.meta.url), 'utf8');
  for (const { slot } of sheetComponents) {
    assert.equal(page.split(`id="${slot}"`).length - 1, 1, `Marcador único: ${slot}`);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Os componentes não podem disputar o mesmo ID');
  // Esses controles são consultados por app/ui/auth antes de qualquer interação do usuário.
  for (const id of ['sel', 'accz', 'session-user', 'logout', 'nm', 'jg', 'mt', 'rl', 'ph', 'pf',
    'ats', 'mut', 'pool', 'pts', 'reg', 'df', 'cd', 'cat', 'hr', 'kn', 'mz', 'mzd', 'mzg',
    'inv', 'nt', 'ntt', 'npg', 'abs', 'wp', 'mview', 'mbar', 'medit', 'bk', 'dp', 'lg', 'cv']) {
    assert.ok(ids.includes(id), `Controle obrigatório: ${id}`);
  }
});

test('abas mantêm o contrato entre seletores e painéis dos grupos existentes', () => {
  for (const [group, values] of [['cx', ['i', 'k', 'm', 'n']], ['kn', ['t', 'd']], ['mz', ['a', 'd']]]) {
    const navigation = html.match(new RegExp(`<div class="sub[^"]*" data-g="${group}">(.*?)</div>`))[1];
    assert.equal((navigation.match(/class="on"/g) || []).length, 1);
    for (const value of values) {
      assert.ok(navigation.includes(`data-s="${value}"`));
      assert.ok(html.includes(`data-gp="${group}" data-sp="${value}"`));
    }
  }
});

test('componentes compartilhados escapam texto e atributos sem remover o conteúdo interno', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const rendered = [
    card({ id: unsafe, title: unsafe, content: '<b>Conteúdo interno</b>' }),
    disclosure({ title: unsafe, content: '<p>Ajuda</p>' }),
    tabs({ group: unsafe, items: [{ value: unsafe, label: unsafe }] }),
  ].join('');
  assert.equal(rendered.includes('<img'), false);
  assert.ok(rendered.includes('&lt;img'));
  assert.ok(rendered.includes('<b>Conteúdo interno</b>'));
});
