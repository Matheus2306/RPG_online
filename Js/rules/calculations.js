import { half } from "../utils/utils.js";
import { state } from "../core/state.js";
import { ROLES } from "./data.js";

/* ============================================================
   4. CÁLCULOS DERIVADOS
   ============================================================ */
function D() {
  const a = state.sheet.at;
  const role = ROLES[state.sheet.role];
  const equipBonus = state.sheet.inv
    .filter((i) => i.eq)
    .reduce((sum, i) => sum + (+i.pr || 0), 0);
  return {
    fol: half(a.carne + a.det), // Fôlego
    dano: half(a.forca + a[state.sheet.db]), // Dano
    cor: half(a.det + a.mente), // Coragem base
    prot: half(a.carne + a.fuga) + equipBonus, // Proteção
    vel: half(a.fuga + a.det), // Velocidade
    eq: equipBonus,
    max: role.e + a.carne + state.sheet.bs, // total de limite de Estresse
    slots: 5 + Math.max(1, a[state.sheet.ia]), // espaços de inventário
    nsp: 3 + half(a.mente), // nº de conhecimentos especializados
  };
}
const cor = () => Math.max(0, D().cor + state.sheet.cd);

export { D, cor };
