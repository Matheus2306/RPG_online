import { getSession, LOGIN_URL, SHEET_URL } from './session.js';

// Executado pelo index.html ao abrir a raiz: sessão válida segue para a ficha; demais casos vão ao login.
// replace remove esta página intermediária do histórico, evitando voltar a ela e redirecionar novamente.
location.replace((getSession() ? SHEET_URL : LOGIN_URL).href);
