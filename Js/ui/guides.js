import { $, $$ } from "../utils/utils.js";
import { state } from "../core/state.js";
import { rollK } from "../combat/combat.js";
import { tgl } from "../character/selections.js";
import { KN, KN_INFO, MZ_INFO } from "../rules/data.js";

/* ---------- 9.5 Guias de descrição (Conhecimentos e Mazelas) ---------- */
function renderKnowledgeGuide(role, x) {
  const intro = `<div class="note"><b>Como funciona:</b> são 10 campos de competência. A Testemunha escolhe qual testar, mas você pode sugerir outro com uma boa justificativa. Cada Persona tem <b>${x.nsp}</b> Conhecimentos Especializados (3 do Papel + ½ Mente) e soma +${state.sheet.sb} ao d20 nos testes deles.</div>`;

  $("#knd").innerHTML =
    intro +
    KN.map((k) => {
      const info = KN_INFO[k],
        spec = state.sheet.sp.includes(k),
        fromRole = role.sp.includes(k);
      return `<div class="info${spec ? " act" : ""}">
      <div class="info-h">
        <b>${k}</b>
        ${fromRole ? '<span class="bg">do Papel</span>' : ""}
        ${spec ? '<span class="bg on">especializado</span>' : ""}
        <button data-rk="${k}">Rolar d20</button>
      </div>
      <p>${info.r}</p>
      <ul>${info.ex.map((e) => `<li>${e}</li>`).join("")}</ul>
      ${info.nt ? `<p class="mu">${info.nt}</p>` : ""}
    </div>`;
    }).join("");
}

// compact = versão curta, usada na lista de mazelas ativas
function mazelaCard(name, compact) {
  const m = MZ_INFO[name],
    on = state.sheet.mz.includes(name);
  const row = (label, text) =>
    text ? `<p><span class="k">${label}</span> ${text}</p>` : "";
  return `<div class="info${on ? " act" : ""}">
    <div class="info-h">
      <b>${name}</b>
      ${on ? '<span class="bg on">ativa</span>' : ""}
      ${compact ? "" : `<button data-mz="${name}">${on ? "Remover" : "Aplicar"}</button>`}
    </div>
    ${compact ? "" : `<p class="q">“${m.q}”</p>`}
    ${compact ? "" : row("Gatilho", m.g)}
    ${row("Efeito", m.e)}
    ${row("Encerra", m.f)}
  </div>`;
}

function renderMazelas() {
  const names = Object.keys(MZ_INFO);
  $("#mzc").textContent = state.sheet.mz.length
    ? `${state.sheet.mz.length} ativa(s)`
    : "";
  $("#mz").innerHTML = names
    .map(
      (m) =>
        `<span class="ch ${state.sheet.mz.includes(m) ? "on" : ""}" data-mz="${m}">${m}</span>`,
    )
    .join("");
  $("#mzd").innerHTML =
    state.sheet.mz.map((m) => mazelaCard(m, true)).join("") ||
    '<div class="mu">Nenhuma mazela ativa. Toque numa condição acima para aplicá-la.</div>';
  $("#mzg").innerHTML = names.map((m) => mazelaCard(m, false)).join("");
}

// Sub-abas genéricas: <div class="sub" data-g="grupo"><button data-s="x">…</button></div>
// mostra os painéis [data-gp="grupo"][data-sp="x"] e esconde os outros do grupo.
function showSubtab(btn) {
  const group = btn.parentNode.dataset.g;
  $$(`.sub[data-g="${group}"] button`).forEach((b) =>
    b.classList.toggle("on", b == btn),
  );
  $$(`[data-gp="${group}"]`).forEach(
    (p) => (p.hidden = p.dataset.sp != btn.dataset.s),
  );
}

// Um único ouvinte de cliques (delegação) para tudo que é gerado dinamicamente
function bindGuides() {
  document.addEventListener("click", (e) => {
    const st = e.target.closest("[data-at]"); // botões − / + dos atributos fixos
    if (st) {
      const i = $(`.at[data-k="${st.dataset.at}"]`);
      i.value = Math.min(10, Math.max(0, (+i.value || 0) + +st.dataset.d));
      return i.dispatchEvent(new Event("input"));
    }
    const tabBtn = e.target.closest(".sub button");
    if (tabBtn) return showSubtab(tabBtn);
    const mz = e.target.closest("[data-mz]");
    if (mz) return tgl("mz", mz.dataset.mz);
    const rk = e.target.closest("[data-rk]");
    if (rk) rollK(rk.dataset.rk);
  });
}

export {
  renderKnowledgeGuide,
  mazelaCard,
  renderMazelas,
  showSubtab,
  bindGuides,
};
