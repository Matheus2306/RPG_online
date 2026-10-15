import { $, d } from "../utils/utils.js";
import { log } from "./history.js";

/* ============================================================
   14. BANDEJA DE DADOS 2D / 3D (painel lateral)
   ============================================================ */
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];
let DQ = { 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 1, 100: 0 }; // quantidade de cada dado
let R3 = null; // renderer 3D (null = não iniciado · false = indisponível)
let diceBusy = false; // animação em andamento
let hideTimer; // esconde o canvas 3D depois da rolagem

// Formas SVG dos dados (modo 2D)
const SHAPES = {
  4: "30,6 56,52 4,52",
  6: "8,8 52,8 52,52 8,52",
  8: "30,4 54,30 30,56 6,30",
  10: "30,3 53,24 43,55 17,55 7,24",
  12: "18,6 42,6 56,30 42,54 18,54 4,30",
  20: "30,3 54,17 54,43 30,57 6,43 6,17",
};

function dUI() {
  $("#dp").innerHTML = DICE_TYPES.map(
    (f) =>
      `<div class="s"><span>d${f}</span><div class="r" style="justify-content:center"><button onclick="dq(${f},-1)">−</button><b id="q${f}">${DQ[f]}</b><button onclick="dq(${f},1)">+</button></div></div>`,
  ).join("");
}

function dq(faces, n) {
  DQ[faces] = Math.max(0, Math.min(20, DQ[faces] + n));
  $("#q" + faces).textContent = DQ[faces];
}

function dSet(preset) {
  // define dados e já rola
  DICE_TYPES.forEach((f) => (DQ[f] = preset[f] || 0));
  dUI();
  dRoll();
}

function dRoll() {
  if (diceBusy) return;
  clearTimeout(hideTimer);

  const dice = [];
  DICE_TYPES.forEach((f) => {
    for (let i = 0; i < DQ[f]; i++) dice.push({ f, v: d(f) });
  });
  if (!dice.length) return;

  const mod = +$("#dmod").value || 0;
  const sum = dice.reduce((a, x) => a + x.v, 0);
  const mode = $("#dmode").value;
  diceBusy = true;

  const done = () => {
    diceBusy = false;
    const label =
      DICE_TYPES.filter((f) => DQ[f])
        .map((f) => DQ[f] + "d" + f)
        .join(" + ") + (mod ? (mod > 0 ? " + " : " − ") + Math.abs(mod) : "");
    const html = `<b>${label}</b>: [${dice.map((x) => x.v)}]${mod ? " " + (mod > 0 ? "+" : "−") + " " + Math.abs(mod) : ""} = <b>${sum + mod}</b>`;
    $("#dres").innerHTML = html;
    log(html);
    if (mode == "3d" && R3) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => ($("#d3").hidden = true), 2600);
    }
  };

  if (mode == "3d" && dice.length <= 12 && R3 !== false) roll3D(dice, done);
  else roll2D(dice, done);
}

// --- 2D: SVG com animação de "tremer" e números aleatórios ---
function roll2D(dice, done) {
  $("#d3").hidden = true;
  const box = $("#d2");
  box.hidden = false;
  box.innerHTML = dice
    .map(
      (x, i) =>
        `<div class="dd rolling" id="dd${i}"><svg viewBox="0 0 60 60">${x.f == 100 ? '<circle cx="30" cy="30" r="26"' : `<polygon points="${SHAPES[x.f]}"`} fill="var(--rc)" stroke="var(--tx)" stroke-width="3" stroke-linejoin="round"/><text x="30" y="36" text-anchor="middle" font-size="${x.f == 100 ? 15 : 18}" fill="#fff" stroke="#000" stroke-width=".6" style="font-family:var(--f-deco)">?</text></svg><div class="mu">d${x.f}</div></div>`,
    )
    .join("");

  let ticks = 0;
  const timer = setInterval(() => {
    ticks++;
    dice.forEach((x, i) => {
      const el = $("#dd" + i + " text");
      if (el) el.textContent = d(x.f);
    });
    if (ticks > 11) {
      clearInterval(timer);
      dice.forEach((x, i) => {
        const el = $("#dd" + i);
        el.classList.remove("rolling");
        el.querySelector("text").textContent = x.v;
        if (x.v == x.f && x.f > 3) el.classList.add("hi");
        if (x.v == 1) el.classList.add("lo");
      });
      done();
    }
  }, 70);
}

// --- 3D: carrega Three.js sob demanda ---
function loadThree(cb) {
  if (window.THREE) return cb(true);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  s.onload = () => cb(!!window.THREE);
  s.onerror = () => cb(false);
  document.head.appendChild(s);
}

function dieGeometry(faces) {
  switch (faces) {
    case 4:
      return new THREE.TetrahedronGeometry(1.5);
    case 6:
      return new THREE.BoxGeometry(1.8, 1.8, 1.8);
    case 8:
      return new THREE.OctahedronGeometry(1.5);
    case 10:
      return new THREE.SphereGeometry(1.5, 5, 2);
    case 12:
      return new THREE.DodecahedronGeometry(1.5);
    default:
      return new THREE.IcosahedronGeometry(1.5); // d20 e d100
  }
}

function roll3D(dice, done, fallback) {
  const go = (ok) => {
    try {
      if (!ok) throw 0;
      $("#d2").hidden = true;
      $("#d3").hidden = false;

      const cv = $("#cv"),
        w = Math.min(700, innerWidth - 20),
        h = 260;
      if (!R3) {
        // primeira vez: cria cena, luzes e câmera
        R3 = {
          r: new THREE.WebGLRenderer({
            canvas: cv,
            antialias: true,
            alpha: true,
          }),
          sc: new THREE.Scene(),
          cm: new THREE.PerspectiveCamera(40, w / h, 0.1, 100),
        };
        R3.sc.add(new THREE.AmbientLight(0xffffff, 0.65));
        const light = new THREE.DirectionalLight(0xffffff, 0.9);
        light.position.set(4, 8, 10);
        R3.sc.add(light);
        R3.cm.position.set(0, 0, 17);
      }
      R3.r.setSize(w, h, false);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      R3.cm.aspect = w / h;
      R3.cm.updateProjectionMatrix();

      // Limpa dados da rolagem anterior
      const scene = R3.sc;
      scene.children
        .filter((o) => o.userData.die)
        .forEach((o) => {
          scene.remove(o);
          o.traverse((q) => {
            if (q.geometry && !q.isSprite) q.geometry.dispose();
          });
        });

      // Cria os dados
      const themeColor = new THREE.Color(
        (
          getComputedStyle(document.body).getPropertyValue("--rc") || ""
        ).trim() || "#d6342a",
      );
      const n = dice.length,
        perRow = Math.min(n, 6),
        rows = Math.ceil(n / perRow);
      const bodies = [];
      const rnd = () =>
        (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1);

      dice.forEach((x, i) => {
        const geo = dieGeometry(x.f);
        const mesh = new THREE.Mesh(
          geo,
          new THREE.MeshLambertMaterial({
            color:
              x.f == 100
                ? themeColor.clone().offsetHSL(0.08, 0, 0.1)
                : themeColor,
            flatShading: true,
          }),
        );
        mesh.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: 0x000000 }),
          ),
        );

        const row = Math.floor(i / perRow),
          col = i % perRow,
          count = Math.min(perRow, n - row * perRow);
        mesh.position.set(
          (col - (count - 1) / 2) * 3.6,
          ((rows - 1) / 2 - row) * 3.6,
          0,
        );
        mesh.userData.die = 1;
        scene.add(mesh);
        bodies.push({
          m: mesh,
          x,
          y0: mesh.position.y,
          v: [rnd(), rnd(), Math.random() * 0.3],
        });
      });

      // Animação: gira e quica, desacelerando; no fim mostra os números
      const T0 = performance.now(),
        DURATION = 1500;
      const frame = (t) => {
        const k = Math.min(1, (t - T0) / DURATION),
          ease = (1 - k) * (1 - k);
        bodies.forEach((o, i) => {
          o.m.rotation.x += o.v[0] * ease * 1.2;
          o.m.rotation.y += o.v[1] * ease * 1.2;
          o.m.rotation.z += o.v[2] * ease;
          o.m.position.y =
            o.y0 + Math.abs(Math.sin(k * Math.PI * 3 + i)) * (1 - k) * 2.2;
        });
        R3.r.render(scene, R3.cm);

        if (k < 1) return requestAnimationFrame(frame);

        bodies.forEach((o) => {
          // sprite com o valor sorteado
          const c = document.createElement("canvas");
          c.width = 128;
          c.height = 64;
          const g = c.getContext("2d");
          g.font = 'bold 40px "Cinzel Decorative", serif';
          g.textAlign = "center";
          g.lineWidth = 7;
          g.strokeStyle = "#000";
          g.fillStyle = "#fff";
          g.strokeText(o.x.v, 64, 46);
          g.fillText(o.x.v, 64, 46);
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: new THREE.CanvasTexture(c),
              depthTest: false,
            }),
          );
          sprite.scale.set(2.4, 1.2, 1);
          sprite.position.set(o.m.position.x, o.y0, 2);
          sprite.userData.die = 1;
          scene.add(sprite);
        });
        R3.r.render(scene, R3.cm);
        done();
      };
      requestAnimationFrame(frame);
    } catch (e) {
      // WebGL indisponível → volta ao 2D
      R3 = false;
      $("#dmode").value = "2d";
      $("#dres").textContent = "3D indisponível neste aparelho; usando 2D.";
      diceBusy = false;
      (fallback || dRoll)();
    }
  };
  loadThree(go);
}

// Mostra os dados 3D durante testes de conhecimento/combate/dano, depois chama cb
function vis(dice, cb) {
  if (
    !$("#v3").checked ||
    R3 === false ||
    !dice.length ||
    dice.length > 12 ||
    diceBusy
  )
    return cb();
  diceBusy = true;
  clearTimeout(hideTimer);
  roll3D(
    dice,
    () => {
      diceBusy = false;
      hideTimer = setTimeout(() => ($("#d3").hidden = true), 2000);
      cb();
    },
    () => cb(),
  );
}

function bindDice() {
  dUI();
  $("#dmode").onchange = () => {
    if ($("#dmode").value == "3d")
      loadThree((ok) => {
        if (!ok) {
          R3 = false;
          $("#dmode").value = "2d";
          $("#dres").textContent = "3D indisponível neste aparelho.";
        }
      });
  };
  if ($("#v3").checked) loadThree(() => {});
}

export {
  DICE_TYPES,
  DQ,
  R3,
  diceBusy,
  hideTimer,
  SHAPES,
  dUI,
  dq,
  dSet,
  dRoll,
  roll2D,
  loadThree,
  dieGeometry,
  roll3D,
  vis,
  bindDice,
};
