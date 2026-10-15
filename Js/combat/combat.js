import { $, $$, d } from "../utils/utils.js";
import { state } from "../core/state.js";
import { D } from "../rules/calculations.js";
import { log } from "../dice/history.js";
import { addStress } from "./stress.js";
import { upd } from "../ui/ui.js";
import { vis } from "../dice/dice.js";
import { RG } from "../rules/data.js";

/* ============================================================
   6. TESTES (conhecimento e combate)
   ============================================================ */
// Retorna [rótulo, valor em sucessos]. Valor > 0 = sucesso, < 0 = falha (quantidade de Estresse)
function zone(total, natural, difficulty) {
  const threshold = { r: 10, n: 13, a: 16 }[difficulty];
  if (natural === 1) return ["Falha Extrema", -2];
  if (natural === 20 || total >= 20) return ["Sucesso Extremo", 2];
  return total >= threshold ? ["Sucesso Regular", 1] : ["Falha Regular", -1];
}
const zoneClass = (v) => (v > 0 ? "ok" : "bad");

function rollK(knowledge) {
  const mod = +$("#md").value || 0;
  const bonus = state.sheet.sp.includes(knowledge) ? +state.sheet.sb : 0;
  const n = d(20);
  const total = n + bonus + mod;
  const [label, value] = zone(total, n, $("#df").value);
  vis([{ f: 20, v: n }], () =>
    log(
      `<b>${knowledge}</b>: d20=${n}${bonus ? " +" + bonus : ""}${mod ? " " + (mod > 0 ? "+" : "") + mod : ""} = ${total} → ${label}`,
      zoneClass(value),
    ),
  );
}

function atk(cb) {
  // cb (opcional): chamado quando o ataque termina (usado pelas macros)
  const regions = $$(".cr:checked").map((x) => x.value);
  if (!regions.length) {
    log("Marque ao menos 1 região para arriscar.");
    return cb && cb();
  }

  const mod = +$("#cm").value || 0;
  const rolls = regions.map(() => d(20));

  vis(
    rolls.map((v) => ({ f: 20, v })),
    () => {
      let score = 0;
      const parts = [];

      regions.forEach((region, i) => {
        const n = rolls[i];
        const [label, value] = zone(n + mod, n, $("#cd").value);
        if (value > 0) score += value;
        else if ($("#ap").checked) addStress(region, -value);
        const regionName = RG.find((x) => x[0] == region)[1];
        parts.push(
          `${regionName} ${n + mod} (${label.replace("Sucesso ", "✔").replace("Falha ", "✘")})`,
        );
      });

      const protection = $("#tp").value;
      const hit = protection !== "" && score >= +protection;
      const hint =
        protection === ""
          ? ""
          : hit
            ? " → <b>ACERTOU</b>"
            : " → não atingiu a Proteção";
      log(
        `<b>Ataque</b>: ${parts.join(" · ")} | sucessos: <b>${score}</b> (Extremo = 2)${hint}`,
        protection === "" ? "" : hit ? "ok" : "bad",
      );
      upd(1);
      cb && cb();
    },
  );
}

// "2d4+1d6" → [soma, [valores], [faces]]
function roll(expr) {
  let total = 0;
  const values = [],
    faces = [];
  (expr || "").replace(/(\d+)d(\d+)/g, (_, qty, sides) => {
    for (let i = 0; i < qty; i++) {
      const x = d(+sides);
      total += x;
      values.push(x);
      faces.push(+sides);
    }
  });
  return [total, values, faces];
}

function dmg(cb) {
  // cb: igual ao atk()
  const weapon = state.sheet.inv.find((i) => i.n + i.sz == $("#wp").value);
  const [total, values, faces] = roll(weapon && weapon.dc);
  const base = D().dano * ($("#vor").checked ? 2 : 1);
  vis(
    values.map((v, i) => ({ f: faces[i], v })),
    () => {
      log(
        `<b>Dano</b>${weapon ? " (" + weapon.n + " " + weapon.dc + ")" : " desarmado"}: [${values}] + Dano ${base} = <b>${total + base}</b> Estresse`,
      );
      cb && cb();
    },
  );
}

export { zone, zoneClass, rollK, atk, roll, dmg };
