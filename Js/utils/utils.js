/* ============================================================
   1. UTILITÁRIOS
   ============================================================ */
const $ = (s) => document.querySelector(s); // selecina um elemento do HTML usando # para Id dos elementos
const $$ = (s) => [...document.querySelectorAll(s)];
const half = (n) => Math.floor(n / 2); // metade, arredondando p/ baixo
const d = (n) => 1 + Math.floor(Math.random() * n); // rola 1dN
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Liga/desliga um valor numa lista
const toggleIn = (arr, v) => {
  const i = arr.indexOf(v);
  i < 0 ? arr.push(v) : arr.splice(i, 1);
};
const esc = (t) =>
  String(t).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const promisify = (fn) => new Promise((done) => fn(done)); // função com callback → promessa (para usar com await)

export { $, $$, half, d, clamp, toggleIn, esc, promisify };
