/**
 * Serviço de autenticação local, compartilhado pelo login, pelas rotas e pela persistência.
 * Contas e sessão ficam em chaves diferentes: sair encerra o acesso sem apagar cadastros ou fichas.
 * O localStorage persiste entre visitas, mas pertence à origem e ao perfil deste navegador.
 * Este controle organiza o acesso na interface; não substitui autorização em um servidor,
 * pois alguém com acesso às ferramentas do navegador pode modificar os dados salvos.
 */
// O sufixo de versão permite distinguir estes formatos em futuras migrações de dados.
const ACCOUNTS_KEY = 'oblivio-contas-v1';
const SESSION_KEY = 'oblivio-sessao-v1';
// Date.now() trabalha em milissegundos; a sessão tem validade fixa de sete dias após o login.
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
// O custo do PBKDF2 dificulta tentativas de adivinhar senhas a partir dos verificadores salvos.
// Alterar este valor exige migrar/versionar o cadastro: ele também é usado para conferir senhas antigas.
const ITERATIONS = 600000;

// URLs relativas ao módulo também permitem hospedar a ficha em uma subpasta.
const APP_URL = new URL('../../', import.meta.url);
const LOGIN_URL = new URL('pages/login/', APP_URL);
const SHEET_URL = new URL('/pages', APP_URL);

/** Lê os cadastros; dados ausentes significam primeiro acesso, formato inválido gera erro. */
function readAccounts() {
  // localStorage armazena texto: JSON reconstrói a lista usada na busca por usuário ou identificador.
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  if (!Array.isArray(accounts)) throw new Error('O cadastro local está inválido. Restaure os dados deste navegador.');
  return accounts;
}

/**
 * Retorna a sessão válida com os dados atuais da conta, ou null para tratar o acesso como desconectado.
 * Não renova a validade: recarregar ou consultar a sessão não estende os sete dias.
 */
function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    // Exigir uma data numérica e futura evita aceitar sessões incompletas ou vencidas.
    if (!session || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) return null;
    // Um identificador de sessão isolado não basta: a conta ainda precisa existir no cadastro local.
    const account = readAccounts().find((item) => item.id === session.accountId);
    if (!account) return null;
    // Nome e propriedade das fichas antigas vêm do cadastro, sem duplicá-los no registro de sessão.
    return { ...session, username: account.username, ownsLegacySheets: account.ownsLegacySheets === true };
  } catch {
    // JSON inválido e falhas de leitura bloqueiam o acesso; isso não detecta toda adulteração manual.
    return null;
  }
}

/** Aplica as mesmas restrições no cadastro e no login, inclusive fora do formulário HTML. */
function validateCredentials(username, password) {
  // As classes Unicode aceitam letras acentuadas; espaços internos e outros símbolos não são permitidos.
  if (!/^[\p{L}\p{N}_.-]{3,32}$/u.test(username)) {
    throw new Error('Use de 3 a 32 letras, números, pontos, traços ou sublinhados no nome de usuário.');
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error('A senha deve ter entre 8 e 128 caracteres.');
  }
}

/**
 * Produz um verificador reproduzível a partir da senha e do salt da conta.
 * O salt é um valor aleatório público: distingue os resultados de contas com a mesma senha.
 * No login, reutilizar o salt permite comparar os resultados sem recuperar a senha original.
 */
async function derivePassword(password, salt) {
  // Web Crypto exige contexto seguro: HTTPS ou a exceção de desenvolvimento em localhost.
  if (!globalThis.crypto?.subtle) {
    throw new Error('Abra a página por HTTPS ou localhost para usar o login local.');
  }
  // A senha vira bytes UTF-8 e uma chave temporária não exportável, restrita à derivação.
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  // O cadastro guarda somente o verificador derivado, nunca a senha digitada.
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(salt), iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
  // Os 256 bits viram 64 caracteres hexadecimais para persistência e comparação em JSON.
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * register=true cria uma conta; false confere as credenciais de uma conta existente.
 * Só grava a sessão depois de concluir o cadastro ou validar a senha.
 * Erros são propagados ao formulário para permitir nova tentativa sem redirecionar.
 */
async function authenticate(username, password, register = false) {
  // NFC unifica representações equivalentes de acentos. A senha permanece exatamente como digitada.
  username = username.trim().normalize('NFC');
  validateCredentials(username, password);
  if (!globalThis.crypto?.subtle) throw new Error('Abra a página por HTTPS ou localhost para usar o login local.');
  // O nome original é exibido na tela; a versão em minúsculas evita contas distintas apenas por caixa.
  const normalizedName = username.toLocaleLowerCase('pt-BR');
  let account = readAccounts().find((item) => item.normalizedName === normalizedName);
  if (register) {
    if (account) throw new Error('Este usuário já existe neste navegador. Entre com sua senha.');
    // Cada cadastro recebe 16 bytes aleatórios; Array permite preservar esses bytes no JSON.
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
    const verifier = await derivePassword(password, salt);
    // PBKDF2 é assíncrono: outra aba pode cadastrar alguém durante a espera.
    // Reler e conferir novamente reduz conflitos, mas localStorage não oferece transações entre abas.
    const accounts = readAccounts();
    if (accounts.some((item) => item.normalizedName === normalizedName)) throw new Error('Este usuário já existe neste navegador.');
    // O UUID mantém o vínculo com as fichas independente do nome escolhido.
    // A primeira conta assume as fichas que já existiam antes da inclusão do login.
    account = { id: crypto.randomUUID(), username, normalizedName, salt, verifier, ownsLegacySheets: accounts.length === 0 };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  } else {
    // Repetimos a derivação com o salt salvo; a mensagem é igual para usuário ausente e senha errada.
    if (!account || await derivePassword(password, account.salt) !== account.verifier) {
      throw new Error('Usuário ou senha incorretos. Confira os dados ou crie sua conta local.');
    }
  }
  // Uma única chave representa a conta ativa nesta origem, compartilhada por todas as abas.
  // A expiração absoluta continua valendo mesmo depois de fechar e reabrir o navegador.
  const session = { accountId: account.id, expiresAt: Date.now() + SESSION_DURATION };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return getSession();
}

/**
 * Guarda de navegação: sem sessão, substitui a página atual pelo login.
 * O chamador precisa respeitar o retorno null, pois redirecionar não interrompe o JavaScript atual.
 */
function requireSession() {
  const session = getSession();
  if (!session) location.replace(LOGIN_URL.href);
  return session;
}

/** Encerra somente a sessão; cadastros e fichas continuam disponíveis para o próximo login. */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  // replace evita manter esta página protegida como a entrada atual do histórico.
  location.replace(LOGIN_URL.href);
}

export { APP_URL, LOGIN_URL, SHEET_URL, SESSION_KEY, authenticate, getSession, requireSession, logout };
