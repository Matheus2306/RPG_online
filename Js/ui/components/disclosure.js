import { esc } from '../../utils/utils.js';

/** Usa details/summary nativos para manter teclado, abertura e fechamento sem novos ouvintes. */
function disclosure({ title, content, id = '', className = 'mini' }) {
  const identifier = id ? ` id="${esc(id)}"` : '';
  // O conteúdo já é um template interno; o título e os atributos são tratados como texto.
  return `<details class="${esc(className)}"${identifier}><summary>${esc(title)}</summary>${content}</details>`;
}

export { disclosure };
