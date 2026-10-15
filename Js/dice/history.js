import { $ } from "../utils/utils.js";
import { state } from "../core/state.js";

/* ============================================================
   5. LOG (histórico)
   ============================================================ */
function log(html, cls) {
  const time = new Date().toTimeString().slice(0, 5);
  state.history.unshift(
    `<div class="${cls || ""}"><span class="mu">${time}</span> ${html}</div>`,
  );
  state.history.length = 40;
  $("#lg").innerHTML = state.history.join("");
}

function hist() {
  // abre/fecha o painel (bandeja + histórico)
  const open = $("#hs").classList.toggle("o");
  document.body.classList.toggle("ho", open);
}

export { log, hist };
