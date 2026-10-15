import { $, $$, half, toggleIn } from "../utils/utils.js";
import { state } from "../core/state.js";
import { D, cor } from "../rules/calculations.js";
import { hist } from "../dice/history.js";
import { isOut } from "../combat/stress.js";
import { meetsReq } from "../inventory/inventory.js";
import { ICONS, renderDeco, setRole, renderPersona } from "../character/persona.js";
import { renderPhoto, bindPhoto } from "../character/photo.js";
import { renderKnowledgeGuide, renderMazelas, bindGuides } from "./guides.js";
import { scheduleSave, fillSheetList } from "../storage/storage.js";
import { currentNote, fillNotes } from "../character/notes.js";
import { renderMacros } from "../macros/macros.js";
import { AT, ATTR_COLOR, KN, RG, ROLES, GER, CAT } from "../rules/data.js";

/* ============================================================
   10. INTERFACE: construção inicial (roda 1 vez)
   ============================================================ */
function build() {
  $("#rl").innerHTML = Object.entries(ROLES)
    .map(
      ([k, r]) =>
        `<button class="rb" data-role="${k}" aria-pressed="false">${ICONS[k]}<span>${r.n}</span><small>Estresse ${r.e}+Carne</small></button>`,
    )
    .join("");
  $("#rl").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-role]");
    if (btn) setRole(btn.dataset.role);
  });

  $("#ats").innerHTML = AT.map(
    ([k, n]) =>
      `<div class="ar"><button class="st" data-at="${k}" data-d="-1">-</button><input type="number" class="at" data-k="${k}" min="0" max="10"><button class="st" data-at="${k}" data-d="1">+</button><span class="an" style="color:${ATTR_COLOR[k]}">${n} <small class="mu">½<b id="h-${k}"></b></small></span></div>`,
  ).join("");

  $("#cat").innerHTML = CAT.map(
    (x) =>
      `<option value="${x}" ${x[0] == "—" ? "disabled" : ""}>${x.split("|")[0]}</option>`,
  ).join("");

  $("#hr").innerHTML = RG.map(
    ([k, n]) => `<option value="${k}">${n}</option>`,
  ).join("");

  $("#kn").innerHTML = KN.map(
    (k) =>
      `<tr><td><label><input type="checkbox" class="sp" value="${k}"> ${k}</label></td><td style="text-align:right"><button onclick="rollK('${k}')">Rolar d20</button></td></tr>`,
  ).join("");

  // Cores do tema
  const THEMES = [
    "#d6342a",
    "#7fa31a",
    "#d93a8c",
    "#e8821a",
    "#2f84d6",
    "#7a3fc2",
    "#17a2a2",
    "#c9a227",
    "#444444",
  ];
  $("#sw").innerHTML = THEMES.map(
    (c) =>
      `<button style="background:${c};width:22px;height:22px;padding:0" title="${c}" onclick="state.sheet.th='${c}';upd()"></button>`,
  ).join("");
  $("#pc").oninput = (e) => {
    state.sheet.th = e.target.value;
    upd();
  };

  bindPhoto();
  bindGuides();

  // Campos simples
  $("#nm").oninput = (e) => {
    state.sheet.name = e.target.value;
    scheduleSave();
  };
  $("#jg").oninput = (e) => {
    state.sheet.player = e.target.value;
    scheduleSave();
  };
  $("#nt").oninput = (e) => {
    currentNote().b = e.target.value;
    scheduleSave();
  };
  $("#ntt").oninput = (e) => {
    currentNote().t = e.target.value;
    fillNotes(1);
    scheduleSave();
  };
  $("#npg").onchange = (e) => {
    state.sheet.np = +e.target.value;
    fillNotes();
  };
  $("#mt").onchange = (e) => {
    state.sheet.mot = e.target.value;
    scheduleSave();
  };
  ["db", "ia", "sb"].forEach(
    (k) =>
      ($("#" + k).onchange = (e) => {
        state.sheet[k] = e.target.value;
        upd();
      }),
  );
  $$(".at").forEach(
    (i) =>
      (i.oninput = () => {
        state.sheet.at[i.dataset.k] = Math.min(10, Math.max(0, +i.value || 0));
        upd(1);
      }),
  );
  $$(".sp").forEach(
    (i) =>
      (i.onchange = () => {
        toggleIn(state.sheet.sp, i.value);
        upd();
      }),
  );
}

/* ============================================================
   11. INTERFACE: atualização (roda a cada mudança)
   ============================================================ */
function upd() {
  const x = D();
  const role = ROLES[state.sheet.role];

  // Tema e foto
  document.body.dataset.role = state.sheet.role;
  state.sheet.th
    ? document.body.style.setProperty("--rc", state.sheet.th)
    : document.body.style.removeProperty("--rc");
  renderPhoto();
  renderPersona(role);
  renderDeco(state.sheet.role);

  // Atributos
  const spent = Object.values(state.sheet.at).reduce((a, b) => a + b, 0);
  $("#pts").innerHTML =
    `<span class="${spent > 10 && state.sheet.lvl == 1 ? "bad" : ""}">${spent}/10 pontos iniciais</span>`;
  AT.forEach(([k]) => ($("#h-" + k).textContent = half(state.sheet.at[k])));

  const eqTxt = x.eq ? ` <small>(+${x.eq})</small>` : "";
  const mut = [
    ["fol", "Fôlego", x.fol],
    ["dano", "Dano", x.dano],
    ["cor", "Coragem", cor()],
    ["prot", "Proteção", x.prot + eqTxt],
    ["vel", "Velocidade", x.vel],
  ];
  $("#mut").innerHTML = mut
    .map(([k, n, v]) => {
      const isCor = k == "cor"; // só a Coragem tem − / + (gastar e ganhar) e o botão de cura
      const minus = isCor
        ? '<button class="st" title="Gastar 1" onclick="state.sheet.cd--;upd()">-</button>'
        : '<i class="st0"></i>';
      const plus = isCor
        ? '<button class="st" title="Ganhar 1" onclick="state.sheet.cd++;upd()">+</button>'
        : '<i class="st0"></i>';
      const cure = isCor
        ? '<button class="st" title="Gastar 1 de Coragem: recupera Estresse igual ao Fôlego (na região escolhida em Cura e limites)" onclick="corHeal()">♥</button>'
        : "";
      return `<div class="ar">${minus}<b class="mv">${v}</b>${plus}<span class="an" style="color:${ATTR_COLOR[k]}">${n}</span>${cure}</div>`;
    })
    .join("");
  $("#lvl").textContent = state.sheet.lvl;

  // Corpo / Estresse
  const used = RG.reduce((a, [k]) => a + state.sheet.lim[k], 0);
  $("#pool").innerHTML =
    `<span class="${used == x.max ? "ok" : "bad"}">limites: ${used}/${x.max}${used < x.max ? ` (faltam ${x.max - used})` : used > x.max ? ` (sobram ${used - x.max})` : " ✓"}</span>`;

  const risk = new Set($$(".cr:checked").map((i) => i.value)); // mantém marcadas as regiões do ataque
  $("#reg").innerHTML = RG.map(([k, n]) => {
    const full = state.sheet.st[k] >= state.sheet.lim[k];
    const pct = Math.min(100, (100 * state.sheet.st[k]) / state.sheet.lim[k]);
    return `<div class="rg ${full ? "x" : ""}">
      <label class="rn"><input type="checkbox" class="cr" value="${k}" ${risk.has(k) && !full ? "checked" : ""}> ${n}</label>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="rgc">
        <button class="st" onclick="heal('${k}',1)">-</button>
        <span>${state.sheet.st[k]}/<input type="number" min="1" value="${state.sheet.lim[k]}" onchange="state.sheet.lim['${k}']=Math.max(1,+this.value||1);upd(1)"></span>
        <button class="st" onclick="addStress('${k}',1);upd(1)">+</button>
      </div></div>`;
  }).join("");
  $("#fo").style.display = isOut() ? "block" : "none";

  // Conhecimentos e combate
  $("#spc").textContent =
    `${state.sheet.sp.length}/${x.nsp} (3 do Papel + ½ Mente)`;
  $$(".sp").forEach((i) => {
    i.checked = state.sheet.sp.includes(i.value);
    i.parentNode.style.fontWeight = role.sp.includes(i.value) ? 700 : 400;
  });
  $$(".cr").forEach((i) => {
    const full = state.sheet.st[i.value] >= state.sheet.lim[i.value];
    i.disabled = full;
    if (full) i.checked = false;
  });

  renderKnowledgeGuide(role, x);

  // Habilidades
  const openAb = new Set($$("#abs details[open]").map((el) => el.dataset.n)); // mantém abertas as descrições
  const abRow = (name, tipo, desc, owned) =>
    `<details class="ab" data-n="${name}" ${openAb.has(name) ? "open" : ""}>
      <summary>${owned === null ? "" : `<input type="checkbox" ${owned ? "checked" : ""} onchange="tgl('ab','${name}')">`}<b>${name}</b> <span class="mu">${tipo}</span></summary>
      <div class="mu">${desc}</div></details>`;
  $("#abs").innerHTML =
    abRow(role.m[0], role.m[1] + " · principal", role.m[2], null) +
    [...role.u, ...GER.map((g) => [g[0], "Geral", g[1]])]
      .map((a) => abRow(a[0], a[1], a[2], state.sheet.ab.includes(a[0])))
      .join("");
  $("#abc").textContent = state.sheet.ab.length + " adquirida(s)";

  // Armas (seletor de dano)
  const weapons = state.sheet.inv.filter((i) => i.dc && !i.us);
  const currentWeapon = $("#wp").value;
  $("#wp").innerHTML =
    '<option value="">Desarmado</option>' +
    weapons
      .map((i) => `<option value="${i.n + i.sz}">${i.n} (${i.dc})</option>`)
      .join("");
  $("#wp").value = currentWeapon;

  // Inventário
  const slotsUsed = state.sheet.inv
    .filter((i) => !i.eq)
    .reduce((a, i) => a + i.sz + i.md, 0);
  $("#slt").innerHTML =
    `<span class="${slotsUsed > x.slots ? "bad" : ""}">espaços ${slotsUsed}/${x.slots}</span>`;
  $("#inv").innerHTML =
    state.sheet.inv
      .map(
        (i, n) =>
          `<div class="r" style="border-bottom:1px solid var(--bd)">
      <label><input type="checkbox" ${i.eq ? "checked" : ""} onchange="invChange(${n},'eq')"> <b>${i.n}</b></label>
      <span class="mu">${i.sz}esp ${i.dc || ""} ${i.pr ? "+" + i.pr + " Prot." : ""}</span>
      ${meetsReq(i.rq) ? "" : '<span class="bad" title="Requisito: ' + i.rq + '">⚠ requisito</span>'}
      <span class="mu">mod</span><button onclick="invChange(${n},'md',-1)">−</button>${i.md}<button onclick="invChange(${n},'md',1)">+</button>
      ${i.us ? `<span class="mu">usos</span><button onclick="invChange(${n},'us',-1)">−</button>${i.us}<button onclick="invChange(${n},'us',1)">+</button>` : ""}
      <button onclick="invChange(${n},'x')">🗑</button>
    </div>`,
      )
      .join("") ||
    '<div class="mu">Mochila vazia. “Equipado” = vestido/empunhado (não ocupa espaço; ★ Proteção só conta equipado).</div>';

  // Mazelas e Fardos
  renderMazelas();
  $("#fac").textContent = `Fora de Ação: ${state.sheet.fo}/3`;
  $("#fa").innerHTML =
    state.sheet.fa.map((f) => `<div>• ${f}</div>`).join("") || "Nenhum.";

  scheduleSave();
}

// Copia o estado (state.sheet) para os campos da tela
function sync() {
  $("#nm").value = state.sheet.name;
  $("#jg").value = state.sheet.player || "";
  fillNotes();
  renderMacros();
  $("#mt").value = state.sheet.mot;
  ["db", "ia", "sb"].forEach((k) => ($("#" + k).value = state.sheet[k]));
  $$(".at").forEach((i) => (i.value = state.sheet.at[i.dataset.k]));
  upd();
  fillSheetList();
}

/* ============================================================
   14b. ATALHOS DA INTERFACE (zona de acerto e painel lateral)
   ============================================================ */
function setZone(z) {
  // um único seletor de dificuldade para todos os testes
  ["#df", "#cd"].forEach((sel) => ($(sel).value = z));
  $$(".zona button").forEach((b) => b.classList.toggle("on", b.dataset.z == z));
}

function openPanel(id) {
  // abre o painel lateral e mostra a bandeja ('tray') ou o histórico ('lgh')
  if (!$("#hs").classList.contains("o")) hist();
  (id == "tray" ? $("#hs .tray") : $("#" + id)).scrollIntoView({
    block: "nearest",
  });
}

export { build, upd, sync, setZone, openPanel };
