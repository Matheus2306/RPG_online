import { blank, state } from './state.js';
import { hist } from '../dice/history.js';
import { build, sync } from '../ui/ui.js';
import { Store, cloud } from '../storage/storage.js';
import { bindDice } from '../dice/dice.js';
import { applyAcc } from '../ui/accessibility.js';

import './legacy-handlers.js';

/* ============================================================
   15. INICIALIZAÇÃO
   ============================================================ */
applyAcc();
bindDice();
if (innerWidth >= 1500) hist(); // só abre sozinho em telas bem largas

build();
(() => {
  // abre a ficha mais recente
  const latest = Object.values(Store.get()).sort((a, b) => b.t - a.t)[0];
  if (latest) state.sheet = Object.assign(blank(), latest);
})();
sync();
cloud();
