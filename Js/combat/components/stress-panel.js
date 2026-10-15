import { card } from '../../ui/components/card.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function stressPanel() {
  return card({ id: "c-est", title: "Estresse", statusId: "pool", content: `
          <div class="silhueta"><div id="reg"></div></div>
          <div id="fo">
            <b class="bad">FORA DE AÇÃO</b> — Torso ou todas as regiões no
            limite.
            <button class="p" onclick="foAct()">
              Registrar (+1 vez, rolar Fardo)
            </button>
          </div>
          <button class="p roll-body" onclick="atk()">🎲 Rolar corpo</button>
        ` });
}

export { stressPanel };
