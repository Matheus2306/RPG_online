import { $ } from "../utils/utils.js";
import { state } from "../core/state.js";
import { upd } from "../ui/ui.js";

/* ============================================================
   8. INVENTÁRIO
   ============================================================ */
// Verifica requisitos tipo "F5C5"
const meetsReq = (req) => {
  const f = /F(\d)/.exec(req || ""),
    c = /C(\d)/.exec(req || "");
  return (
    (!f || state.sheet.at.forca >= +f[1]) &&
    (!c || state.sheet.at.carne >= +c[1])
  );
};

function addCat() {
  const p = $("#cat").value.split("|");
  if (p.length < 2) return;
  state.sheet.inv.push({
    n: p[0],
    sz: +p[1],
    dc: p[2] || "",
    pr: +p[3] || 0,
    rq: p[4] || "",
    us: +p[5] || 0,
    md: 0,
    eq: false,
  });
  upd(1);
}

function addCus() {
  const name = $("#cn").value.trim();
  if (!name) return;
  state.sheet.inv.push({
    n: name,
    sz: +$("#cs").value || 0,
    dc: "",
    pr: 0,
    rq: "",
    us: 0,
    md: 0,
    eq: false,
  });
  $("#cn").value = "";
  upd(1);
}

// k: 'x' remove · 'eq' alterna equipado · 'md'/'us' soma v (mod / usos)
function invChange(i, k, v) {
  if (k == "x") state.sheet.inv.splice(i, 1);
  else if (k == "eq") state.sheet.inv[i].eq = !state.sheet.inv[i].eq;
  else state.sheet.inv[i][k] = Math.max(0, state.sheet.inv[i][k] + v);
  upd(1);
}

export { meetsReq, addCat, addCus, invChange };
