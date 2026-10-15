import { $, $$ } from "../utils/utils.js";

/* ============================================================
   14d. ACESSIBILIDADE (preferências salvas neste aparelho, não na ficha)
   ============================================================ */
const ACC_KEY = "oblivio-acessibilidade-v1";
const ACC_ZOOMS = [1, 1.15, 1.3, 1.5, 1.75, 2];
const ACC_PADRAO = {
  zoom: 0,
  read: false,
  contrast: false,
  space: false,
  big: false,
  focus: false,
  calm: false,
};
let ACC = { ...ACC_PADRAO };
try {
  Object.assign(ACC, JSON.parse(localStorage.getItem(ACC_KEY) || "{}"));
} catch (e) {}

function applyAcc() {
  const z = ACC_ZOOMS[ACC.zoom] || 1;
  document.body.style.zoom = z;
  ["read", "contrast", "space", "big", "focus", "calm"].forEach((k) =>
    document.body.classList.toggle("a-" + k, !!ACC[k]),
  );
  $("#accz").textContent = Math.round(z * 100) + "%";
  $$("[data-acc]").forEach((i) => (i.checked = !!ACC[i.dataset.acc]));
  try {
    localStorage.setItem(ACC_KEY, JSON.stringify(ACC));
  } catch (e) {}
}
function accZoom(step) {
  ACC.zoom = Math.min(ACC_ZOOMS.length - 1, Math.max(0, ACC.zoom + step));
  applyAcc();
}
function accReset() {
  ACC = { ...ACC_PADRAO };
  applyAcc();
}
document.addEventListener("change", (e) => {
  const k = e.target.dataset && e.target.dataset.acc;
  if (k) {
    ACC[k] = e.target.checked;
    applyAcc();
  }
});

export { ACC_KEY, ACC_ZOOMS, ACC_PADRAO, ACC, applyAcc, accZoom, accReset };
