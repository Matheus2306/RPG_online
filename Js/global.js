import { requireSession } from './auth/session.js';
import { bindProtectedPage } from './auth/protected-page.js';

// Esta guarda também cobre quem acessa o HTML da ficha diretamente, sem passar pela raiz.
const session = requireSession();
if (session) {
  // Os componentes precisam existir no DOM antes de app.js procurar campos e registrar os eventos.
  // A montagem também fica após a guarda para não criar o conteúdo da ficha sem uma sessão válida.
  const { mountSheet } = await import('./core/sheet-page.js');
  mountSheet();
  // A ficha e seus efeitos de persistência só são inicializados após validar a sessão.
  // Um import estático executaria app.js antes desta condição, inclusive para usuários desconectados.
  await import('./core/app.js');
  const { persist } = await import('./storage/storage.js');
  // Depois de inicializar, acompanha logout em outras abas, troca de usuário e vencimento da sessão.
  bindProtectedPage(session, persist);
  // O HTML começa oculto por CSS; só é revelado quando a ficha e a proteção contínua estão prontas.
  document.documentElement.removeAttribute('data-auth-pending');
}
