import { $, half, d } from "../utils/utils.js";
import { state } from "../core/state.js";
import { D, cor } from "../rules/calculations.js";
import { log } from "../dice/history.js";
import { upd } from "../ui/ui.js";
import { AT, RG, FARDO } from "../rules/data.js";

/* ============================================================
   7. ESTRESSE, CURA E FORA DE AÇÃO
   ============================================================ */
function addStress(region, amount) {
  const space = state.sheet.lim[region] - state.sheet.st[region];
  if (amount <= space) {
    state.sheet.st[region] += amount;
  } else {
    // transborda para o Torso
    state.sheet.st[region] = state.sheet.lim[region];
    if (region != "torso")
      state.sheet.st.torso = Math.min(
        state.sheet.lim.torso,
        state.sheet.st.torso + amount - space,
      );
  }
}

function heal(region, amount) {
  state.sheet.st[region] = Math.max(0, state.sheet.st[region] - amount);
  upd(1);
}

function healAny(amount) {
  // cura distribuída pelas regiões
  RG.forEach(([k]) => {
    const x = Math.min(amount, state.sheet.st[k]);
    state.sheet.st[k] -= x;
    amount -= x;
  });
}

function corHeal() {
  if (cor() < 1) return log("Sem Coragem.", "bad");
  state.sheet.cd--;
  heal($("#hr").value, D().fol);
}

function autoLim() {
  const total = D().max;
  const each = Math.max(1, Math.floor(total / 6));
  RG.forEach(([k]) => (state.sheet.lim[k] = each));
  state.sheet.lim.torso = total - 4 * each;
  upd(1);
}

const isOut = () =>
  state.sheet.st.torso >= state.sheet.lim.torso ||
  RG.every(([k]) => state.sheet.st[k] >= state.sheet.lim[k]);

function foAct() {
  state.sheet.fo++;
  if (state.sheet.fo >= 3) {
    state.sheet.fa.push("☠ 3ª vez Fora de Ação: a Persona morreu.");
    return upd(1);
  }

  const [name, text] = FARDO[d(6) - 1];
  let extra = "";

  if (name == "Guilhotina")
    extra =
      " — " +
      ["Braço Esq.", "Braço Dir.", "Perna Esq.", "Perna Dir."][d(4) - 1];
  if (name == "Deterioração") {
    let a;
    do a = d(6);
    while (a == 6); // sorteia entre os 5 atributos
    extra = ` — ${AT[a - 1][1]} −${d(4)} (aplique no atributo)`;
  }
  if (name == "Mal das Pernas") state.sheet.bs--;

  healAny(state.sheet.fo == 1 ? half(D().max) : Math.max(1, D().fol));
  ["No Chão", "Sem Reação"].forEach(
    (m) => !state.sheet.mz.includes(m) && state.sheet.mz.push(m),
  );

  state.sheet.fa.push(`${state.sheet.fo}ª vez: ${name}${extra} — ${text}`);
  log(`<b>Fora de Ação (${state.sheet.fo}ª)</b>: Fardo ${name}${extra}`, "bad");
  upd(1);
}

function lvlUp() {
  const gain = Math.max(1, half(state.sheet.at.carne));
  state.sheet.lvl++;
  state.sheet.bs += gain;
  $("#lvm").innerHTML =
    `Nível ${state.sheet.lvl}: +${gain} de limite de Estresse (distribua nas regiões) e escolha <b>${1 + (+$("#dead").value || 0)}</b> habilidade(s).`;
  upd(1);
}

export { addStress, heal, healAny, corHeal, autoLim, isOut, foAct, lvlUp };
