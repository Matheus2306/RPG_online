import { card } from './card.js';
import { tabs } from './tabs.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function characterPanels() {
  return `<div class="zona" id="c-zona">
          <span>Zona de acerto (vale para todos os testes)</span>
          <button data-z="r" onclick="setZone('r')">Reduzida</button>
          <button data-z="n" class="on" onclick="setZone('n')">Normal</button>
          <button data-z="a" onclick="setZone('a')">Aumentada</button>
          <select id="df" hidden>
            <option value="r"></option>
            <option value="n" selected></option>
            <option value="a"></option>
          </select>
          <select id="cd" hidden>
            <option value="r"></option>
            <option value="n" selected></option>
            <option value="a"></option>
          </select>
        </div>

        <div class="tools" id="c-tools">
          <button onclick="openPanel('tray')">🎲 Rolagem livre</button>
          <button onclick="openPanel('lgh')">📜 Histórico</button>
        </div>

        ${card({ id: "c-tabs", content: `
          ${tabs({"group": "cx", "items": [{"value": "i", "label": "Inventário"}, {"value": "k", "label": "Conhecimentos"}, {"value": "m", "label": "Mazelas"}, {"value": "n", "label": "Notas"}], "className": "tabs"})}

          <!-- Inventário -->
          <div data-gp="cx" data-sp="i">
            <div class="mu" id="slt"></div>
            <div class="r">
              <select id="cat"></select
              ><button onclick="addCat()">Adicionar</button>
            </div>
            <div class="r">
              <input id="cn" placeholder="Item próprio" style="flex: 1" />
              <input type="number" id="cs" value="1" min="0" />
              <button onclick="addCus()">+</button>
            </div>
            <div id="inv"></div>
          </div>

          <!-- Conhecimentos -->
          <div data-gp="cx" data-sp="k" hidden>
            <div class="mu" id="spc"></div>
            ${tabs({"group": "kn", "items": [{"value": "t", "label": "Testes"}, {"value": "d", "label": "Descrições"}]})}
            <div data-gp="kn" data-sp="t">
              <div class="r">
                Mod <input type="number" id="md" value="0" /> Espec.
                <select id="sb">
                  <option>2</option>
                  <option>3</option>
                </select>
              </div>
              <table id="kn"></table>
              <div class="mu">
                O livro cita +2 (cap. Testes e exemplos) e +3 (cap.
                Conhecimentos). Padrão: +2.
              </div>
            </div>
            <div data-gp="kn" data-sp="d" hidden><div id="knd"></div></div>
          </div>

          <!-- Mazelas e Fardos -->
          <div data-gp="cx" data-sp="m" hidden>
            <div class="mu" id="mzc"></div>
            ${tabs({"group": "mz", "items": [{"value": "a", "label": "Condições"}, {"value": "d", "label": "Descrições"}]})}
            <div data-gp="mz" data-sp="a">
              <div class="r" id="mz"></div>
              <div id="mzd"></div>
            </div>
            <div data-gp="mz" data-sp="d" hidden><div id="mzg"></div></div>
            <div class="mu" style="margin-top: 10px">
              <b>Fardos</b> <span id="fac"></span>
            </div>
            <div id="fa" class="mu"></div>
          </div>

          <!-- Notas (várias páginas) -->
          <div data-gp="cx" data-sp="n" hidden>
            <div class="r">
              <select id="npg"></select>
              <input
                id="ntt"
                placeholder="Título da página"
                style="flex: 1; min-width: 100px"
              />
              <button onclick="addN()">+</button>
              <button onclick="delN()">Excluir</button>
            </div>
            <textarea
              id="nt"
              style="min-height: 260px"
              placeholder="História, aliados, pistas, sessões…"
            ></textarea>
          </div>
        ` })}

        <!-- Ações e Habilidades (coluna da direita, abaixo das abas) -->
        ${card({ id: "c-hab", title: "Ações e Habilidades", statusId: "abc", content: `
          <div id="abs"></div>
        ` })}`;
}

export { characterPanels };
