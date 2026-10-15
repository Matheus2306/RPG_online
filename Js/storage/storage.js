import { $ } from "../utils/utils.js";
import { blank, state } from "../core/state.js";
import { sync } from "../ui/ui.js";
import { getSession } from "../auth/session.js";

/* ============================================================
   12. PERSISTÊNCIA (localStorage + conta na nuvem, se houver)
   ============================================================ */
// Captura a conta que abriu este módulo; a chave não muda no meio da edição ao trocar de conta em outra aba.
const session = getSession();
// A primeira conta mantém as fichas existentes; as demais possuem espaços próprios.
const STORAGE_KEY = session?.ownsLegacySheets
  ? "oblivio-fichas-v1"
  : `oblivio-fichas-v1:${session?.accountId}`;
let cloudCol = null; // coleção do banco da conta (null = só navegador)

const Store = {
  get() {
    // Compara a conta original com a sessão atual antes de ler fichas desta aba.
    // Se o acesso terminou ou mudou de usuário, não entrega dados antigos à interface.
    if (!session || getSession()?.accountId !== session.accountId) return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  },
  set(obj) {
    // Revalida na escrita: uma aba antiga ou um salvamento atrasado não pode persistir após a troca de conta.
    if (!session || getSession()?.accountId !== session.accountId) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      /* storage indisponível */
    }
  },
};

function scheduleSave() {
  // debounce de 600 ms
  clearTimeout(saveTimer);
  $("#stt").textContent = "…";
  saveTimer = setTimeout(() => persist(), 600);
}

function persist(manual) {
  // Uma aba antiga não pode gravar após logout, expiração ou troca de conta.
  if (!session || getSession()?.accountId !== session.accountId) return;
  state.sheet.t = Date.now();
  const all = Store.get();
  all[state.sheet.id] = state.sheet;
  Store.set(all);
  if (cloudCol)
    cloudCol
      .doc(state.sheet.id)
      .set({ j: JSON.stringify(state.sheet) })
      .catch(() => {});
  fillSheetList();
  $("#stt").textContent =
    (cloudCol ? "salvo na conta ☁ + navegador" : "salvo neste navegador") +
    (manual ? " ✓" : "");
}

function fillSheetList() {
  const all = Store.get();
  $("#sel").innerHTML = Object.values(all)
    .sort((a, b) => b.t - a.t)
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id == state.sheet.id ? "selected" : ""}>${c.name || "(sem nome)"}</option>`,
    )
    .join("");
}

function load(id) {
  const saved = Store.get()[id];
  if (!saved) return;
  state.sheet = Object.assign(blank(), saved);
  sync();
}

function nova() {
  state.sheet = blank();
  sync();
  persist();
}

function del() {
  if (!confirm("Excluir esta ficha?")) return;
  const all = Store.get();
  delete all[state.sheet.id];
  Store.set(all);
  if (cloudCol)
    cloudCol
      .doc(state.sheet.id)
      .delete()
      .catch(() => {});
  const next = Object.values(all)[0];
  state.sheet = next ? Object.assign(blank(), next) : blank();
  sync();
  persist();
}

function imp() {
  try {
    const obj = JSON.parse($("#bk").value);
    state.sheet = Object.assign(blank(), obj, {
      id: "c" + Date.now().toString(36),
    });
    sync();
    persist(1);
  } catch (e) {
    alert("JSON inválido.");
  }
}

async function dl() {
  try {
    const k = await claude.use("downloads");
    if (!k) throw 0;
    await k.save({
      filename: "ficha-" + (state.sheet.name || "persona") + ".json",
      data: JSON.stringify(state.sheet, null, 1),
    });
  } catch (e) {
    $("#bk").value = JSON.stringify(state.sheet, null, 1);
    alert("Download indisponível aqui: copie o JSON da caixa de texto.");
  }
}

async function cloud() {
  try {
    if (!window.claude) return;
    const db = await claude.use("db");
    const user = await claude.use("user");
    const uid = user && (await user.id());
    if (!db || !uid) return;

    cloudCol = db.collection("data/users/" + uid);
    const snap = await cloudCol.get();
    const all = Store.get();
    snap.docs.forEach((doc) => {
      // vence a versão mais recente
      try {
        const o = JSON.parse(doc.data().j);
        if (!all[o.id] || (all[o.id].t || 0) < (o.t || 0)) all[o.id] = o;
      } catch (e) {
        /* documento inválido: ignora */
      }
    });
    Store.set(all);

    const current = all[state.sheet.id] || Object.values(all)[0];
    if (current) state.sheet = Object.assign(blank(), current);
    sync();
    $("#stt").textContent = "conta ☁ conectada";
  } catch (e) {
    cloudCol = null;
  }
}

let saveTimer; // Timer privado do salvamento automático.

export {
  STORAGE_KEY,
  cloudCol,
  Store,
  scheduleSave,
  persist,
  fillSheetList,
  load,
  nova,
  del,
  imp,
  dl,
  cloud,
};
