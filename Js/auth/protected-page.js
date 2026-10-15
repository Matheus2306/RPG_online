import { getSession, logout, requireSession, SESSION_KEY } from "./session.js";
import { $ } from "../utils/utils.js";

/**
 * Mantém a ficha aberta vinculada à conta que a inicializou.
 * Recebe save como callback para salvar antes da saída sem importar a persistência neste módulo.
 */
function bindProtectedPage(session, save) {
  // textContent exibe o nome como texto, sem interpretá-lo como HTML.
  $("#session-user").textContent = session.username;
  $("#logout").addEventListener("click", () => {
    // Salva alterações pendentes somente se esta aba ainda pertence à conta ativa.
    if (getSession()?.accountId === session.accountId) save();
    logout();
  });
  const checkSession = () => {
    // O teste também cobre expiração: nesses casos, getSession retorna null.
    if (getSession()?.accountId !== session.accountId) {
      // O CSS esconde imediatamente o conteúdo da conta anterior enquanto a página é reiniciada.
      document.documentElement.setAttribute("data-auth-pending", "");
      // Recarregar descarta o estado da conta anterior antes de trocar de usuário.
      location.reload();
      return;
    }
    // Revalida a guarda de entrada; esta função não renova nem prolonga a sessão.
    requireSession();
  };
  window.addEventListener("storage", (event) => {
    // storage avisa as OUTRAS abas da mesma origem; key=null indica limpeza completa do armazenamento.
    // Na aba que executa logout, o próprio logout faz o redirecionamento.
    if (event.key === SESSION_KEY || event.key === null) checkSession();
  });
  // pageshow também ocorre ao restaurar uma página do cache de navegação do botão Voltar.
  window.addEventListener("pageshow", checkSession);
  // Ao retornar à aba, confere novamente porque abas em segundo plano podem ter temporizadores suspensos.
  window.addEventListener("focus", checkSession);
  // A expiração também é respeitada quando a página fica aberta sem interação.
  // O tempo restante usa a data do login, sem reiniciar os sete dias a cada carregamento da ficha.
  setTimeout(checkSession, Math.max(0, session.expiresAt - Date.now()));
}

export { bindProtectedPage };
