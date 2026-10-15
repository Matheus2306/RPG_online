import { esc } from '../../utils/utils.js';

/**
 * Reutiliza o contrato de guides.js: data-g identifica o grupo e data-s seleciona o painel.
 * Cada item possui value/label; o primeiro começa ativo, como nos painéis originais.
 */
function tabs({ group, items, className = '' }) {
  const buttons = items.map(({ value, label }, index) =>
    `<button type="button"${index === 0 ? ' class="on"' : ''} data-s="${esc(value)}">${esc(label)}</button>`,
  ).join('');
  return `<div class="sub${className ? ` ${esc(className)}` : ''}" data-g="${esc(group)}">${buttons}</div>`;
}

export { tabs };
