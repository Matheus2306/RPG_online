import { esc } from '../../utils/utils.js';

/**
 * Moldura comum dos cartões da ficha: título, indicador opcional e conteúdo.
 * content recebe apenas HTML dos componentes internos; dados do usuário devem passar por esc().
 * Os IDs e as classes existentes são preservados para os estilos e handlers da ficha.
 */
function card({ id, title = '', statusId = '', className = '', style = '', content }) {
  const status = statusId ? ` <span class="mu" id="${esc(statusId)}"></span>` : '';
  const heading = title ? `<h2>${esc(title)}${status}</h2>` : '';
  const inlineStyle = style ? ` style="${esc(style)}"` : '';
  return `<section class="c${className ? ` ${esc(className)}` : ''}" id="${esc(id)}"${inlineStyle}>${heading}${content}</section>`;
}

export { card };
