import { card } from '../../ui/components/card.js';

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function backupPanel() {
  return card({ id: "bkc", title: "Backup (JSON)", style: "display: none; max-width: 1200px; margin: 12px auto", content: `
      <textarea id="bk"></textarea>
      <div class="r">
        <button onclick="$('#bk').value = JSON.stringify(state.sheet, null, 1)">
          Gerar JSON desta ficha
        </button>
        <button onclick="dl()">Baixar arquivo</button>
        <button class="p" onclick="imp()">Importar do texto</button>
      </div>
      <div class="mu">
        Para levar a ficha a outro lugar: gere o JSON, copie, e cole lá em
        “Importar”.
      </div>
    ` });
}

export { backupPanel };
