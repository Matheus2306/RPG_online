import { $, half } from "../utils/utils.js";
import { D } from "../rules/calculations.js";
import { hist } from "../dice/history.js";
import { rollK, atk, dmg } from "../combat/combat.js";
import { heal, addStress, corHeal, autoLim, foAct, lvlUp } from "../combat/stress.js";
import { addCat, addCus, invChange } from "../inventory/inventory.js";
import { tgl } from "../character/selections.js";
import { upd, setZone, openPanel } from "../ui/ui.js";
import { load, nova, del, persist, imp, dl } from "../storage/storage.js";
import { addN, delN } from "../character/notes.js";
import { dq, dSet, dRoll } from "../dice/dice.js";
import {
  runMacro,
  macroSeed,
  macroEdit,
  macroClose,
  macroSave,
  macroDel,
} from "../macros/macros.js";
import { accZoom, accReset } from "../ui/accessibility.js";
import { state } from "./state.js";

// Compatibilidade com os handlers inline do HTML e dos templates.
Object.assign(window, {
  state,
  $,
  half,
  D,
  hist,
  rollK,
  atk,
  dmg,
  heal,
  addStress,
  corHeal,
  autoLim,
  foAct,
  lvlUp,
  addCat,
  addCus,
  invChange,
  tgl,
  upd,
  setZone,
  openPanel,
  load,
  nova,
  del,
  persist,
  imp,
  dl,
  addN,
  delN,
  dq,
  dSet,
  dRoll,
  runMacro,
  macroSeed,
  macroEdit,
  macroClose,
  macroSave,
  macroDel,
  accZoom,
  accReset,
});
