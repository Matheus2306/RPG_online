import { card } from '../../ui/components/card.js';
import { disclosure } from '../../ui/components/disclosure.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function attributesCard() {
  return card({ id: "c-attr", title: "Atributos e Aspectos", statusId: "pts", content: `
          <div class="attr">
            <div id="ats"></div>
            <div id="mut"></div>
          </div>
          ${disclosure({ title: "Como o Dano e o Inventário são calculados", content: `
            <div class="r mu">
              Dano = (Força +
              <select id="db">
                <option value="carne">Carne</option>
                <option value="fuga">Fuga</option></select
              >)/2 · Inventário = 5 +
              <select id="ia">
                <option value="carne">Carne</option>
                <option value="forca">Força</option>
              </select>
            </div>
            <div class="mu">
              “½” = metade (arredonda para baixo). Início: 10 pontos, máx. 10
              cada.
            </div>
          ` })}
        ` });
}

export { attributesCard };
