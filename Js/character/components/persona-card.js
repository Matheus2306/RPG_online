import { card } from '../../ui/components/card.js';
import { disclosure } from '../../ui/components/disclosure.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function personaCard() {
  return card({ id: "c-persona", title: "Minha Persona", className: "persona", content: `
          <div class="p-emblem" id="emb" aria-hidden="true"></div>

          <div class="p-photo">
            <div class="frame">
              <div class="frame-bg"></div>
              <div
                id="ph"
                class="ph"
                tabindex="0"
                role="img"
                aria-label="Foto da Persona"
                title="Arraste para reposicionar · role ou use a barra para dar zoom"
              ></div>
            </div>
            <div class="r" style="justify-content: center">
              <button id="pfb">Foto</button>
              <input type="file" id="pf" accept="image/*" hidden />
            </div>
            ${disclosure({ title: "Ajustar foto", content: `
              <label class="r p-zoom"
                >Zoom
                <input
                  type="range"
                  id="pz"
                  min="1"
                  max="3"
                  step="0.02"
                  value="1"
                  disabled
              /></label>
              <div class="r" style="justify-content: center">
                <button id="prs" disabled>Centralizar</button>
                <button id="prm" disabled>Remover</button>
              </div>
              <div class="mu" id="phint"></div>
            ` })}
          </div>

          <div class="p-info">
            <div class="pgrid">
              <label
                >Nome<input
                  id="nm"
                  class="p-name"
                  placeholder="Nome da Persona"
                  autocomplete="off"
              /></label>
              <label
                >Motivação
                <select id="mt">
                  <option value="">—</option>
                  <option>Alcançar o Ideal</option>
                  <option>Dar o Troco</option>
                  <option>Encontrar Aquilo</option>
                  <option>Salvar Aquilo</option>
                  <option>Seguir as Regras</option>
                  <option>Se Redimir</option>
                </select>
              </label>
              <label
                >Jogador<input
                  id="jg"
                  placeholder="Seu nome"
                  autocomplete="off"
              /></label>
              <label
                >Nível
                <span class="r" style="margin: 0"
                  ><b id="lvl" style="color: var(--tx)"></b>
                  <button onclick="lvlUp()">Subir</button></span
                >
              </label>
            </div>
            <div class="r mu">
              mortes na missão
              <input type="number" id="dead" value="0" min="0" />
            </div>
            <div class="mu" id="lvm"></div>

            <div class="p-tag" id="rtag"></div>
            <div
              class="p-roles"
              id="rl"
              role="group"
              aria-label="Papel da Persona"
            ></div>
            <div class="g5 p-stats" id="pst" hidden></div>

            ${disclosure({ title: "Cor da ficha", content: `
              <div class="r">
                <span id="sw" class="r"></span>
                <input
                  type="color"
                  id="pc"
                  title="Cor personalizada"
                  style="width: 36px; padding: 1px"
                />
                <button
                  onclick="
                    state.sheet.th = '';
                    upd();
                  "
                >
                  Automática (Papel)
                </button>
              </div>
            ` })}
          </div>
        ` });
}

export { personaCard };
