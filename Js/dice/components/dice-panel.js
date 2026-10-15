

// Template de apresentação: mantém os IDs e eventos consumidos pelos módulos da ficha.
function dicePanel() {
  return `<aside id="hs">
      <div class="r" style="padding: 8px 8px 0">
        <b style="flex: 1">Bandeja de dados</b>
        <button onclick="hist()">×</button>
      </div>

      <div class="tray">
        <div id="dp"></div>
        <div class="r">
          Mod <input type="number" id="dmod" value="0" />
          <select id="dmode">
            <option value="2d">2D</option>
            <option value="3d">3D</option>
          </select>
          <button class="p" onclick="dRoll()">Rolar!</button>
        </div>
        <div class="r" id="qk">
          <button onclick="dSet({ 20: 1 })">d20</button>
          <button onclick="dSet({ 6: 1 })">d6</button>
          <button onclick="dSet({ 6: 2 })">2d6</button>
          <button onclick="dSet({ 4: 2 })">2d4</button>
          <button onclick="dSet({ 10: 1 })">d10</button>
          <button onclick="dSet({ 100: 1 })">d100</button>
          <button onclick="dSet({ 4: 1, 6: 1, 8: 1, 10: 1, 12: 1, 20: 1 })">
            Todos
          </button>
          <button onclick="dSet({})">Zerar</button>
        </div>
        <div id="d2" class="r" style="justify-content: center"></div>
        <div id="dres" style="font-size: 12px; text-align: center">
          Monte os dados e clique em Rolar.
        </div>
        <label class="r"
          ><input type="checkbox" id="v3" checked /> Dados 3D nos testes da
          ficha</label
        >
      </div>

      <div class="r" id="lgh" style="padding: 8px 8px 0">
        <b style="flex: 1">Histórico</b>
        <button
          onclick="
            state.history = [];
            $('#lg').innerHTML = '';
          "
        >
          Limpar
        </button>
      </div>
      <div id="lg"></div>
    </aside>
    <button id="hb" onclick="hist()" title="Dados e histórico">🎲</button>

    <div
      id="d3"
      hidden
      style="
        position: fixed;
        left: 0;
        right: 0;
        top: 18vh;
        text-align: center;
        pointer-events: none;
        z-index: 50;
      "
    >
      <canvas id="cv"></canvas>
    </div>`;
}

export { dicePanel };
