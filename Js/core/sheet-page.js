import { $ } from '../utils/utils.js';
import { sheetHeader } from '../ui/components/sheet-header.js';
import { personaCard } from '../character/components/persona-card.js';
import { attributesCard } from '../character/components/attributes-card.js';
import { stressPanel } from '../combat/components/stress-panel.js';
import { characterPanels } from '../ui/components/character-panels.js';
import { actionDock } from '../ui/components/action-dock.js';
import { backupPanel } from '../storage/components/backup-panel.js';
import { dicePanel } from '../dice/components/dice-panel.js';

// O HTML define a composição e a ordem das colunas; cada contexto fornece apenas seu conteúdo.
const sheetComponents = [
  { slot: 'mount-header', render: sheetHeader },
  { slot: 'mount-persona', render: personaCard },
  { slot: 'mount-stress', render: stressPanel },
  { slot: 'mount-attributes', render: attributesCard },
  { slot: 'mount-panels', render: characterPanels },
  { slot: 'mount-actions', render: actionDock },
  { slot: 'mount-backup', render: backupPanel },
  { slot: 'mount-dice', render: dicePanel },
];

/** Monta uma vez, após validar a sessão e antes de registrar os eventos da ficha. */
function mountSheet() {
  const pending = sheetComponents.map(({ slot, render }) => {
    const target = $(`#${slot}`);
    if (!target) throw new Error(`Espaço do componente não encontrado: ${slot}`);
    const template = document.createElement('template');
    // Apenas templates internos entram neste ponto; nomes e textos de usuário não compõem este HTML.
    template.innerHTML = render();
    return { target, content: template.content };
  });
  // Substituir o marcador não adiciona wrappers: seletores, parentesco e estilos continuam compatíveis.
  // Todos os marcadores são conferidos antes da primeira alteração para evitar montagem parcial.
  pending.forEach(({ target, content }) => target.replaceWith(content));
}

export { mountSheet, sheetComponents };
