import { card } from './card.js';
import { disclosure } from './disclosure.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function actionDock() {
  return `<section class="dock" id="dock">
      ${card({ id: "dk-atk", title: "Ataque e dano", className: "dk", content: `
        <div class="dk-body">
          <div class="r">
            Mod <input type="number" id="cm" value="0" /> Proteção do alvo
            <input type="number" id="tp" placeholder="—" />
          </div>
          <div class="r">
            <label
              ><input type="checkbox" id="ap" checked /> aplicar Estresse das
              falhas</label
            >
          </div>
          <div class="r">
            Arma
            <select id="wp"></select>
          </div>
          <div class="r">
            <label
              ><input type="checkbox" id="vor" /> ×2 no dano (Voracidade)</label
            >
          </div>
          <div class="mu">
            As regiões do ataque são as marcadas no cartão Estresse.
          </div>
        </div>
        <div class="dk-btns">
          <button class="p" onclick="atk()">🎲 Rolar corpo</button>
          <button class="p" onclick="dmg()">🎲 Rolar dano</button>
        </div>
      ` })}

      ${card({ id: "dk-cura", title: "Cura e limites", className: "dk", content: `
        <div class="dk-body">
          <div class="r">
            Curar <input type="number" id="hn" value="5" min="1" /> em
            <select id="hr"></select>
          </div>
          <div class="r">
            <button onclick="$('#hn').value = 5">Ração (5)</button>
            <button onclick="$('#hn').value = 5 + D().fol">
              Descanso (5+Fôlego)
            </button>
          </div>
          <div class="mu">
            “Distribuir limites” reparte o Estresse máximo entre as 5 regiões.
          </div>
        </div>
        <div class="dk-btns">
          <button class="p" onclick="heal($('#hr').value, +$('#hn').value)">
            Recuperar
          </button>
          <button onclick="autoLim()">Distribuir limites</button>
        </div>
      ` })}

      ${card({ id: "dk-mac", title: "Macros", statusId: "mcn", className: "dk", content: `
        <div class="dk-body" id="mview"></div>
        <div class="dk-btns" id="mbar">
          <button onclick="macroEdit(-1)">+ Nova macro</button>
        </div>
        <div class="dk-edit" id="medit" hidden>
          <input id="mnm" placeholder="Nome da macro" />
          <textarea
            id="msc"
            spellcheck="false"
            placeholder="atacar torso be bd&#10;dano"
          ></textarea>
          ${disclosure({ title: "Comandos disponíveis", content: `
            <pre class="mu" id="mhelp"></pre>
          ` })}
          <div class="dk-btns">
            <button class="p" onclick="macroSave()">Salvar</button>
            <button onclick="macroClose()">Cancelar</button>
            <button onclick="macroDel()" id="mdel">Excluir</button>
          </div>
        </div>
      ` })}
    </section>`;
}

export { actionDock };
