import { toggleIn } from "../utils/utils.js";
import { state } from "../core/state.js";
import { upd } from "../ui/ui.js";

function tgl(key, v) {
  toggleIn(state.sheet[key], v);
  upd(1);
}

export { tgl };
