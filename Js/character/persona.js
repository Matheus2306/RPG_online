import { $, $$ } from "../utils/utils.js";
import { state } from "../core/state.js";
import { D, cor } from "../rules/calculations.js";
import { upd } from "../ui/ui.js";
import { RG } from "../rules/data.js";

/* ============================================================
   9. PERSONA E IDENTIDADE VISUAL
      foto (enquadramento), Papel, decoração e guias de descrição
   ============================================================ */

/* ---------- 9.1 Ícones SVG (traço simples; herdam a cor via currentColor) ---------- */
const svgIcon = (body) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const GLYPH = {
  // Quem Age
  claw: svgIcon(
    '<path d="M14 8 L30 56"/><path d="M28 6 L44 54"/><path d="M42 4 L58 52"/>',
  ),
  drop: svgIcon(
    '<path d="M32 6 C32 6 14 28 14 40 A18 18 0 0 0 50 40 C50 28 32 6 32 6 Z"/>',
  ),
  sword: svgIcon(
    '<path d="M54 10 L26 38"/><path d="M18 30 L34 46"/><path d="M26 38 L10 54"/><path d="M54 10 V20 M54 10 H44"/>',
  ),
  spark: svgIcon('<path d="M32 4 V60 M4 32 H60 M12 12 L52 52 M52 12 L12 52"/>'),
  // Quem Cuida
  heart: svgIcon(
    '<path d="M32 56 C8 40 6 22 18 15 C25 11 31 16 32 21 C33 16 39 11 46 15 C58 22 56 40 32 56 Z"/>',
  ),
  cross: svgIcon(
    '<path d="M24 8 H40 V24 H56 V40 H40 V56 H24 V40 H8 V24 H24 Z"/>',
  ),
  leaf: svgIcon(
    '<path d="M12 52 C12 24 30 10 54 10 C54 36 40 54 14 52 Z"/><path d="M12 52 L38 26"/>',
  ),
  flask: svgIcon(
    '<path d="M24 6 H40 M26 6 V24 L10 52 A4 4 0 0 0 14 58 H50 A4 4 0 0 0 54 52 L38 24 V6"/><path d="M18 42 H46"/>',
  ),
  // Quem Protege
  shield: svgIcon(
    '<path d="M32 6 L54 14 V32 C54 46 44 54 32 60 C20 54 10 46 10 32 V14 Z"/><path d="M32 18 V48 M20 28 H44"/>',
  ),
  lock: svgIcon(
    '<rect x="12" y="28" width="40" height="28" rx="4"/><path d="M20 28 V20 A12 12 0 0 1 44 20 V28"/><circle cx="32" cy="42" r="3"/>',
  ),
  wall: svgIcon(
    '<rect x="6" y="14" width="52" height="38"/><path d="M6 27 H58 M6 40 H58 M24 14 V27 M42 27 V40 M24 40 V52"/>',
  ),
  chain: svgIcon(
    '<rect x="4" y="22" width="32" height="20" rx="10"/><rect x="28" y="22" width="32" height="20" rx="10"/>',
  ),
  // Quem Resolve
  gear: svgIcon(
    '<circle cx="32" cy="32" r="24" stroke-width="7" stroke-dasharray="9.42 9.42"/><circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="6"/>',
  ),
  bulb: svgIcon(
    '<path d="M32 6 A16 16 0 0 1 41 35 V42 H23 V35 A16 16 0 0 1 32 6 Z"/><path d="M25 50 H39 M27 56 H37"/>',
  ),
  check: svgIcon(
    '<circle cx="32" cy="32" r="24"/><path d="M20 33 L29 42 L45 24"/>',
  ),
  key: svgIcon(
    '<circle cx="20" cy="32" r="12"/><path d="M32 32 H58 M50 32 V42 M42 32 V40"/>',
  ),
  // Quem Sabe
  book: svgIcon(
    '<path d="M32 16 C24 10 14 10 6 14 V50 C14 46 24 46 32 52 C40 46 50 46 58 50 V14 C50 10 40 10 32 16 Z"/><path d="M32 16 V52"/>',
  ),
  pencil: svgIcon(
    '<path d="M10 54 L14 40 L44 10 L54 20 L24 50 Z"/><path d="M38 16 L48 26"/>',
  ),
  cap: svgIcon(
    '<path d="M32 12 L60 26 L32 40 L4 26 Z"/><path d="M16 33 V46 C24 54 40 54 48 46 V33"/><path d="M60 26 V42"/>',
  ),
  atom: svgIcon(
    '<ellipse cx="32" cy="32" rx="26" ry="10"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="3"/>',
  ),
};

// Emblema de cada Papel (botão do seletor + marca d'água do cartão Persona)
const ICONS = {
  age: GLYPH.claw,
  cuida: GLYPH.heart,
  protege: GLYPH.shield,
  resolve: GLYPH.gear,
  sabe: GLYPH.book,
};

/* ---------- 9.2 Decoração flutuante por Papel ----------
   g = ícones · t = textos · every = a cada N itens, 1 é texto · font = estilo do texto */
const DECO = {
  age: {
    every: 3,
    font: "pix",
    g: ["claw", "drop", "sword", "spark"],
    t: ["SLASH!", "BAM!", "CRASH", "RAAH!"],
  },
  cuida: {
    every: 3,
    font: "pix",
    g: ["heart", "cross", "leaf", "flask"],
    t: ["+5", "+3", "+10", "♥"],
  },
  protege: {
    every: 3,
    font: "pix",
    g: ["shield", "lock", "wall", "chain"],
    t: ["BLOQUEOU!", "PROT +2", "DEF", "0"],
  },
  resolve: {
    every: 3,
    font: "pix",
    g: ["gear", "bulb", "check", "key"],
    t: ["PLANO B", "FEITO!", "?!", "1·2·3"],
  },
  sabe: {
    every: 2,
    font: "sab",
    g: ["book", "pencil", "cap", "atom"],
    t: [
      "∑",
      "π",
      "√x",
      "∫",
      "E=mc²",
      "a²+b²=c²",
      "Δ",
      "∞",
      "f(x)",
      "x²",
      "sin θ",
      "log n",
    ],
  },
};

// Aleatório com semente: a decoração de um Papel é sempre a mesma, sem "pular" a cada atualização
const hashStr = (s) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
function seededRandom(seed) {
  // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let decoRole = null;
function renderDeco(roleKey) {
  if (decoRole === roleKey) return; // só redesenha quando o Papel muda
  decoRole = roleKey;

  const cfg = DECO[roleKey],
    rand = seededRandom(hashStr(roleKey));
  const COUNT = 26,
    COLS = 7,
    ROWS = 4; // grade com "jitter": espalha sem agrupar
  let g = 0,
    t = 0,
    html = "";

  for (let i = 0; i < COUNT; i++) {
    const asText = i % cfg.every === cfg.every - 1;
    const vars = {
      x: ((((i % COLS) + 0.1 + rand() * 0.75) / COLS) * 100).toFixed(1) + "%",
      y:
        (((Math.floor(i / COLS) + 0.1 + rand() * 0.75) / ROWS) * 100).toFixed(
          1,
        ) + "%",
      s: Math.round(asText ? 18 + rand() * 22 : 34 + rand() * 46) + "px",
      r: Math.round((rand() - 0.5) * 50) + "deg",
      o: (0.11 + rand() * 0.09).toFixed(2),
      t: (7 + rand() * 7).toFixed(1) + "s", // duração da flutuação
      dl: "-" + (rand() * 8).toFixed(1) + "s", // atraso negativo = cada item em fase diferente
      fi: (rand() * 0.6).toFixed(2) + "s", // atraso da entrada
    };
    const style = Object.entries(vars)
      .map(([k, v]) => `--${k}:${v}`)
      .join(";");
    html += asText
      ? `<span class="dc tx ${cfg.font}" style="${style}">${cfg.t[t++ % cfg.t.length]}</span>`
      : `<span class="dc" style="${style}">${GLYPH[cfg.g[g++ % cfg.g.length]]}</span>`;
  }
  $("#deco").innerHTML = html;
}

/* ---------- 9.3 Papel e cartão Persona ---------- */
function setRole(key) {
  if (key == state.sheet.role) return;
  if (
    state.sheet.ab.length &&
    !confirm("Trocar de Papel remove as habilidades escolhidas. Continuar?")
  )
    return;
  state.sheet.role = key;
  state.sheet.ab = [];
  upd();
}

function renderPersona(role) {
  const x = D();
  const cur = RG.reduce((a, [k]) => a + state.sheet.st[k], 0);
  const cap = RG.reduce((a, [k]) => a + state.sheet.lim[k], 0);

  $("#emb").innerHTML = ICONS[state.sheet.role];
  $("#rtag").textContent = `“${role.tag}”`;
  $$("#rl .rb").forEach((b) => {
    const on = b.dataset.role == state.sheet.role;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
  });
  $("#pst").innerHTML = [
    ["Estresse", `${cur}/${cap}`],
    ["Fôlego", x.fol],
    ["Proteção", x.prot],
    ["Coragem", cor()],
  ]
    .map(([n, v]) => `<div class="s">${n}<b>${v}</b></div>`)
    .join("");
}

export {
  svgIcon,
  GLYPH,
  ICONS,
  DECO,
  hashStr,
  seededRandom,
  decoRole,
  renderDeco,
  setRole,
  renderPersona,
};
