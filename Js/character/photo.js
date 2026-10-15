import { $, clamp } from "../utils/utils.js";
import { state } from "../core/state.js";
import { upd } from "../ui/ui.js";
import { scheduleSave } from "../storage/storage.js";

/* ---------- 9.4 Foto: enquadramento (arrastar, zoom, centralizar) ----------
   state.sheet.pos = { x, y, z }: (x, y) é o ponto da imagem (0–1) que fica no centro da moldura; z é o zoom.
   Guardar o ponto focal (e não pixels) mantém o enquadramento correto em qualquer tamanho de tela. */
const PHOTO_MAX_SIDE = 512;
const ZOOM_MAX = 3;
const defaultPos = () => ({ x: 0.5, y: 0.5, z: 1 });
let shownPhoto = null; // evita reaplicar a imagem (base64 grande) a cada movimento

function photoBox() {
  // medidas da moldura e da imagem já ampliada
  const el = $("#ph"),
    fw = el.clientWidth,
    fh = el.clientHeight;
  if (!state.sheet.imgW || !fw || !fh) return null;
  const scale =
    Math.max(fw / state.sheet.imgW, fh / state.sheet.imgH) * state.sheet.pos.z; // "cover" × zoom
  return { fw, fh, dw: state.sheet.imgW * scale, dh: state.sheet.imgH * scale };
}

function clampPos() {
  // impede mostrar áreas vazias nas bordas
  state.sheet.pos.z = clamp(state.sheet.pos.z, 1, ZOOM_MAX);
  const b = photoBox();
  if (!b) return;
  const mx = b.fw / 2 / b.dw,
    my = b.fh / 2 / b.dh;
  state.sheet.pos.x = clamp(state.sheet.pos.x, mx, 1 - mx);
  state.sheet.pos.y = clamp(state.sheet.pos.y, my, 1 - my);
}

function renderPhoto() {
  const el = $("#ph"),
    has = !!state.sheet.img;
  el.classList.toggle("has", has);
  $("#pz").disabled = $("#prs").disabled = $("#prm").disabled = !has;
  $("#phint").textContent = has
    ? "Arraste para reposicionar · role ou use a barra para dar zoom"
    : "Clique na moldura para escolher uma foto";

  if (!has) {
    shownPhoto = null;
    el.style.backgroundImage = "none";
    el.textContent = "+ foto";
    return;
  }
  el.textContent = "";

  if (!state.sheet.imgW) {
    // ficha antiga: descobre o tamanho da imagem uma vez
    const probe = new Image();
    probe.onload = () => {
      state.sheet.imgW = probe.naturalWidth;
      state.sheet.imgH = probe.naturalHeight;
      renderPhoto();
    };
    probe.src = state.sheet.img;
    return;
  }

  clampPos();
  const b = photoBox();
  if (!b) return; // moldura sem tamanho (aba oculta): tab() redesenha depois
  if (shownPhoto !== state.sheet.img) {
    el.style.backgroundImage = `url("${state.sheet.img}")`;
    shownPhoto = state.sheet.img;
  }
  el.style.backgroundSize = `${b.dw}px ${b.dh}px`;
  el.style.backgroundPosition = `${b.fw / 2 - state.sheet.pos.x * b.dw}px ${b.fh / 2 - state.sheet.pos.y * b.dh}px`;
  $("#pz").value = state.sheet.pos.z;
}

function loadPhoto(file, input) {
  // redimensiona (máx. 512 px) e guarda como JPEG base64
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(
        1,
        PHOTO_MAX_SIDE / Math.max(img.width, img.height),
      );
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      state.sheet.img = cv.toDataURL("image/jpeg", 0.85);
      state.sheet.imgW = cv.width;
      state.sheet.imgH = cv.height;
      state.sheet.pos = defaultPos();
      upd();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  input.value = "";
}

function clearPhoto() {
  state.sheet.img = "";
  state.sheet.imgW = state.sheet.imgH = 0;
  state.sheet.pos = defaultPos();
  upd();
}

function bindPhoto() {
  const el = $("#ph");
  const pointers = new Map(); // dedos/cursores ativos (1 = arrastar, 2 = pinça)
  let pinch = null;
  const refresh = () => {
    renderPhoto();
    scheduleSave();
  };

  el.addEventListener("click", () => {
    if (!state.sheet.img) $("#pf").click();
  });

  el.addEventListener("pointerdown", (e) => {
    if (!state.sheet.img) return;
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size == 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: state.sheet.pos.z };
    }
  });

  el.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId),
      box = prev && photoBox();
    if (!box) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (pointers.size == 2 && pinch) {
      // pinça: zoom
      pointers.set(e.pointerId, cur);
      const [a, b] = [...pointers.values()];
      state.sheet.pos.z =
        (pinch.z * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.dist;
    } else {
      // arrastar: move o ponto focal no sentido contrário
      state.sheet.pos.x -= (cur.x - prev.x) / box.dw;
      state.sheet.pos.y -= (cur.y - prev.y) / box.dh;
      pointers.set(e.pointerId, cur);
    }
    renderPhoto();
  });

  const release = (e) => {
    // salva só ao soltar (não a cada pixel arrastado)
    if (!pointers.delete(e.pointerId)) return;
    pinch = null;
    scheduleSave();
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);

  el.addEventListener(
    "wheel",
    (e) => {
      // zoom com a roda do mouse
      if (!state.sheet.img) return;
      e.preventDefault();
      state.sheet.pos.z -= e.deltaY * 0.0015;
      refresh();
    },
    { passive: false },
  );

  el.addEventListener("keydown", (e) => {
    // acessibilidade: setas movem, +/- dão zoom
    if (!state.sheet.img) {
      if (e.key == "Enter" || e.key == " ") {
        e.preventDefault();
        $("#pf").click();
      }
      return;
    }
    const move = {
      ArrowLeft: [-0.03, 0],
      ArrowRight: [0.03, 0],
      ArrowUp: [0, -0.03],
      ArrowDown: [0, 0.03],
    }[e.key];
    if (move) {
      e.preventDefault();
      state.sheet.pos.x += move[0];
      state.sheet.pos.y += move[1];
      refresh();
    } else if (e.key == "+" || e.key == "=") {
      state.sheet.pos.z += 0.1;
      refresh();
    } else if (e.key == "-") {
      state.sheet.pos.z -= 0.1;
      refresh();
    }
  });

  $("#pz").addEventListener("input", (e) => {
    state.sheet.pos.z = +e.target.value;
    refresh();
  });
  $("#pfb").onclick = () => $("#pf").click();
  $("#prs").onclick = () => {
    state.sheet.pos = defaultPos();
    refresh();
  };
  $("#prm").onclick = clearPhoto;
  $("#pf").onchange = (e) => loadPhoto(e.target.files[0], e.target);
  window.addEventListener("resize", renderPhoto);
}

export {
  PHOTO_MAX_SIDE,
  ZOOM_MAX,
  defaultPos,
  shownPhoto,
  photoBox,
  clampPos,
  renderPhoto,
  loadPhoto,
  clearPhoto,
  bindPhoto,
};
