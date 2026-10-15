import { $, $$, d, esc, promisify } from "../utils/utils.js";
import { state } from "../core/state.js";
import { D } from "../rules/calculations.js";
import { log } from "../dice/history.js";
import { atk, dmg } from "../combat/combat.js";
import { addStress, heal } from "../combat/stress.js";
import { upd, setZone } from "../ui/ui.js";
import { scheduleSave } from "../storage/storage.js";
import { vis } from "../dice/dice.js";
import { RG } from "../rules/data.js";

/* ============================================================
   14c. MACROS (um passo por linha; ficam salvas na ficha)
   ============================================================ */
const REGIAO = {
  torso: "torso",
  tronco: "torso",
  be: "be",
  bd: "bd",
  pe: "pe",
  pd: "pd",
  "braco-esq": "be",
  "braco-dir": "bd",
  "perna-esq": "pe",
  "perna-dir": "pd",
};
let macroIdx = -1,
  macroBusy = false; // macro em edição (-1 = nova) e trava de execução

const MACRO_EXEMPLOS = [
  { n: "Ataque padrão", s: "atacar torso be bd\ndano" },
  {
    n: "Descanso",
    s: "curar 5+folego torso\nnota Descansou na fogueira",
  },
  { n: "Teste rápido", s: "zona n\ndados 1d20" },
];
const MACRO_AJUDA = `atacar [torso be bd pe pd | todas]   rola o corpo (sem regiões: as marcadas)
dano [arma] [x2]                    rola o dano (x2 = Voracidade)
dados 2d6+1                         rola dados livres
curar N [região]                    N: 5, folego ou 5+folego
estresse N [região]                 soma Estresse
coragem N                           ganha (+) ou gasta (−) Coragem
zona r|n|a                          Reduzida, Normal, Aumentada
nota texto                          escreve no histórico
# linha começada com # é comentário`;

function macroNum(txt) {
  // "5+folego-1" → número (só aceita somas simples)
  const t = String(txt)
    .toLowerCase()
    .replace(/f[oô]lego/g, D().fol)
    .replace(/\s+/g, "");
  if (!/^[+-]?\d+([+-]\d+)*$/.test(t)) return NaN;
  return t.match(/[+-]?\d+/g).reduce((a, b) => a + +b, 0);
}

async function macroStep(line) {
  const [cmd, ...a] = line.split(/\s+/),
    arg = a.join(" ");
  switch (cmd.toLowerCase()) {
    case "atacar": {
      if (a.length) {
        // marca as regiões pedidas
        const todas = a.some((x) => x.toLowerCase() == "todas");
        const want = new Set(
          todas
            ? RG.map((r) => r[0])
            : a.map((x) => REGIAO[x.toLowerCase()]).filter(Boolean),
        );
        $$(".cr").forEach(
          (c) => (c.checked = want.has(c.value) && !c.disabled),
        );
      }
      return promisify(atk);
    }
    case "dano": {
      const x2 = /(^|\s)(x2|×2)(\s|$)/i.test(arg);
      const name = arg
        .replace(/(^|\s)(x2|×2)(\s|$)/i, " ")
        .trim()
        .toLowerCase();
      if (name) {
        const opt = [...$("#wp").options].find((o) =>
          o.text.toLowerCase().includes(name),
        );
        if (opt) $("#wp").value = opt.value;
        else log(`Macro: arma "${esc(name)}" não encontrada.`, "bad");
      }
      $("#vor").checked = x2;
      return promisify(dmg);
    }
    case "dados": {
      const dice = [];
      let mod = 0,
        bad = false;
      arg
        .replace(/\s+/g, "")
        .replace(/-/g, "+-")
        .split("+")
        .filter(Boolean)
        .forEach((t) => {
          const m = /^(\d*)d(\d+)$/i.exec(t);
          if (m)
            for (let i = 0; i < (+m[1] || 1); i++)
              dice.push({ f: +m[2], v: d(+m[2]) });
          else if (/^-?\d+$/.test(t)) mod += +t;
          else bad = true;
        });
      if (bad || !dice.length) {
        log('Macro: use "dados 2d6+1".', "bad");
        return false;
      }
      await promisify((done) => vis(dice, done));
      const sum = dice.reduce((s, x) => s + x.v, 0);
      log(
        `<b>${esc(arg)}</b>: [${dice.map((x) => x.v)}]${mod ? " " + (mod > 0 ? "+" : "−") + " " + Math.abs(mod) : ""} = <b>${sum + mod}</b>`,
      );
      return;
    }
    case "curar":
    case "estresse": {
      const n = macroNum(a[0] || ""),
        r =
          REGIAO[(a[1] || "").toLowerCase()] ||
          (cmd == "curar" ? $("#hr").value : "torso");
      if (isNaN(n)) {
        log(`Macro: valor inválido em "${esc(line)}".`, "bad");
        return false;
      }
      if (cmd.toLowerCase() == "curar") heal(r, n);
      else {
        addStress(r, n);
        upd(1);
      }
      return;
    }
    case "coragem": {
      const n = macroNum(a[0] || "");
      if (isNaN(n)) {
        log(`Macro: valor inválido em "${esc(line)}".`, "bad");
        return false;
      }
      state.sheet.cd += n;
      upd();
      return;
    }
    case "zona": {
      const z = (a[0] || "")[0];
      if ("rna".includes(z || "-")) setZone(z);
      return;
    }
    case "nota":
      log("📝 " + esc(arg));
      return;
    default:
      log(
        `Macro: comando desconhecido "<b>${esc(cmd)}</b>". Veja “Comandos disponíveis”.`,
        "bad",
      );
      return false;
  }
}

async function runMacro(i) {
  if (macroBusy) return;
  macroBusy = true;
  const m = state.sheet.macros[i];
  log(`▶ Macro <b>${esc(m.n)}</b>`);
  try {
    for (const line of m.s
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && l[0] != "#"))
      if ((await macroStep(line)) === false) break;
  } finally {
    macroBusy = false;
  }
}

function renderMacros() {
  state.sheet.macros = state.sheet.macros || [];
  $("#mcn").textContent = state.sheet.macros.length
    ? state.sheet.macros.length + ""
    : "";
  $("#mview").innerHTML =
    state.sheet.macros
      .map(
        (m, i) =>
          `<div class="mc"><button class="p" onclick="runMacro(${i})">▶ ${esc(m.n)}</button><button class="st" title="Editar" onclick="macroEdit(${i})">✎</button></div>`,
      )
      .join("") ||
    '<div class="mu">Nenhuma macro ainda. Uma macro é uma lista de passos (um por linha) que roda com um toque.</div><div class="mu"><button onclick="macroSeed()">Criar 3 exemplos</button></div>';
}
function macroSeed() {
  state.sheet.macros = MACRO_EXEMPLOS.map((m) => ({ ...m }));
  scheduleSave();
  renderMacros();
}
function macroEdit(i) {
  macroIdx = i;
  const m = state.sheet.macros[i] || { n: "", s: "" };
  $("#mnm").value = m.n;
  $("#msc").value = m.s;
  $("#mhelp").textContent = MACRO_AJUDA;
  $("#mdel").hidden = i < 0;
  ["#mview", "#mbar"].forEach((x) => ($(x).hidden = true));
  $("#medit").hidden = false;
}
function macroClose() {
  ["#mview", "#mbar"].forEach((x) => ($(x).hidden = false));
  $("#medit").hidden = true;
}
function macroSave() {
  const n = $("#mnm").value.trim(),
    s = $("#msc").value.trim();
  if (!n || !s) return;
  if (macroIdx < 0) state.sheet.macros.push({ n, s });
  else state.sheet.macros[macroIdx] = { n, s };
  scheduleSave();
  renderMacros();
  macroClose();
}
function macroDel() {
  if (macroIdx < 0 || !confirm("Excluir esta macro?")) return;
  state.sheet.macros.splice(macroIdx, 1);
  scheduleSave();
  renderMacros();
  macroClose();
}

export {
  REGIAO,
  macroIdx,
  MACRO_EXEMPLOS,
  MACRO_AJUDA,
  macroNum,
  macroStep,
  runMacro,
  renderMacros,
  macroSeed,
  macroEdit,
  macroClose,
  macroSave,
  macroDel,
};
