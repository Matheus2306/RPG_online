import { $ } from "../utils/utils.js";
import { state } from "../core/state.js";
import { scheduleSave } from "../storage/storage.js";

/* ============================================================
   13. ANOTAÇÕES (aba interna do cartão da direita)
   ============================================================ */
function currentNote() {
  if (!state.sheet.notes || !state.sheet.notes.length)
    state.sheet.notes = [{ t: "Anotações", b: state.sheet.nt || "" }];
  state.sheet.np = Math.min(state.sheet.np || 0, state.sheet.notes.length - 1);
  return state.sheet.notes[state.sheet.np];
}

function fillNotes(titleOnly) {
  currentNote();
  const sel = $("#npg");
  sel.innerHTML = "";
  state.sheet.notes.forEach((n, i) =>
    sel.add(new Option(n.t || "(sem título)", i)),
  );
  sel.value = state.sheet.np;
  if (!titleOnly) {
    $("#ntt").value = state.sheet.notes[state.sheet.np].t;
    $("#nt").value = state.sheet.notes[state.sheet.np].b;
  }
}

function addN() {
  currentNote();
  state.sheet.notes.push({ t: "Nova página", b: "" });
  state.sheet.np = state.sheet.notes.length - 1;
  fillNotes();
  scheduleSave();
}

function delN() {
  currentNote();
  if (state.sheet.notes.length < 2 || !confirm("Excluir esta página?")) return;
  state.sheet.notes.splice(state.sheet.np, 1);
  state.sheet.np = 0;
  fillNotes();
  scheduleSave();
}

export { currentNote, fillNotes, addN, delN };
