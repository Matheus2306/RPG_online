import { disclosure } from './disclosure.js';

/** Cabeçalho compartilhado pela ficha, com ações e preferências sem regras de domínio. */
function sheetHeader() {
  const more = disclosure({
    title: 'Mais',
    className: 'menu',
    content: `<div class="mb">
      <button onclick="del()">Excluir ficha</button>
      <button onclick="$('#bk').parentNode.style.display = 'block'">Backup</button>
    </div>`,
  });
  const accessibility = disclosure({
    title: 'Aa Acessibilidade',
    id: 'acc',
    className: 'menu',
    content: `<div class="mb acc">
      <div class="r">
        Tamanho do texto
        <button onclick="accZoom(-1)" aria-label="Diminuir o texto">A−</button>
        <b id="accz">100%</b>
        <button onclick="accZoom(1)" aria-label="Aumentar o texto">A+</button>
      </div>
      <label><input type="checkbox" data-acc="read" /> Fonte de alta legibilidade</label>
      <label><input type="checkbox" data-acc="contrast" /> Alto contraste</label>
      <label><input type="checkbox" data-acc="space" /> Mais espaço entre letras e linhas</label>
      <label><input type="checkbox" data-acc="big" /> Botões e campos maiores</label>
      <label><input type="checkbox" data-acc="focus" /> Destacar o item selecionado</label>
      <label><input type="checkbox" data-acc="calm" /> Reduzir fundo e efeitos</label>
      <button onclick="accReset()">Restaurar padrão</button>
    </div>`,
  });
  // Cada menu fica integralmente dentro de seu grupo, sem cruzar o fechamento dos elementos.
  return `<header class="sheet-header">
    <div class="d-align">
      <h1>🕯️ Oblívio RPG <small>ficha alternativa</small></h1>
      <select id="sel" onchange="load(this.value)"></select>
      <button onclick="nova()">+ Nova</button>
      <button class="p" onclick="persist(1)">Salvar</button>
      ${more}
    </div>
    <div class="d-align">
      ${accessibility}
      <span id="stt" class="mu"></span>
      <span id="session-user" aria-label="Usuário conectado"></span>
      <button id="logout" type="button">Sair</button>
    </div>
  </header>`;
}

export { sheetHeader };
