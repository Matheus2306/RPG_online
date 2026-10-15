
/* ============================================================
   3. ESTADO
   ============================================================ */
// Ficha vazia. Abreviações: at=atributos, db/ia=atributo usado em Dano/Inventário,
// sb=bônus de especialização, sp=conhecimentos, lim/st=limite/valor de Estresse por região,
// cd=ajuste de Coragem, fo=vezes Fora de Ação, fa=fardos, mz=mazelas, ab=habilidades,
// inv=inventário, bs=bônus de Estresse por nível/fardos, th=cor do tema, img=foto (imgW/imgH = tamanho; pos = enquadramento)
const blank = () => ({
  id: "c" + Date.now().toString(36),
  name: "",
  role: "age",
  mot: "",
  lvl: 1,
  bs: 0,
  at: { carne: 0, forca: 0, fuga: 0, mente: 0, det: 0 },
  db: "carne",
  ia: "carne",
  sb: 2,
  sp: [],
  lim: { torso: 4, be: 2, bd: 2, pe: 2, pd: 2 },
  st: { torso: 0, be: 0, bd: 0, pe: 0, pd: 0 },
  cd: 0,
  fo: 0,
  fa: [],
  mz: [],
  ab: [],
  inv: [],
  nt: "",
  player: "",
  img: "",
  imgW: 0,
  imgH: 0,
  pos: { x: 0.5, y: 0.5, z: 1 },
  th: "",
  macros: [],
});

const state = { sheet: blank(), history: [] };

export { blank, state };
