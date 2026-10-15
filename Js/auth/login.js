import { authenticate, getSession, SHEET_URL } from "./session.js";
// Reutiliza o atalho de seleção do projeto para manter o acesso ao DOM consistente entre os contextos.
import { $ } from "../utils/utils.js";

// Este módulo cuida da interação do formulário; regras e gravação da sessão ficam em session.js.
const form = $("#login-form");
const username = $("#username");
const password = $("#password");
const confirmation = $("#confirmation");
const message = $("#auth-message");
const submit = $("#auth-submit");
const toggle = $("#auth-toggle");
let register = false; // O mesmo formulário inicia em modo login e pode alternar para cadastro.

// Quem já possui sessão válida pode continuar na ficha sem informar as credenciais novamente.
if (getSession()) location.replace(SHEET_URL.href);

toggle.addEventListener("click", () => {
  // A confirmação só é obrigatória no cadastro; autocomplete orienta o gerenciador de senhas.
  register = !register;
  $("#auth-title").textContent = register
    ? "Crie sua conta"
    : "Entre no Oblívio";
  $("#confirmation-field").hidden = !register;
  confirmation.required = register;
  password.autocomplete = register ? "new-password" : "current-password";
  submit.textContent = register ? "Criar conta e entrar" : "Entrar na ficha";
  toggle.textContent = register
    ? "Já tenho uma conta"
    : "Criar uma conta local";
  // Limpa o feedback do modo anterior e posiciona o teclado no início do novo fluxo.
  message.textContent = "";
  confirmation.value = "";
  username.focus();
});

$("#show-password").addEventListener("click", (event) => {
  // Mostrar altera apenas a apresentação; aria-pressed informa o estado às tecnologias assistivas.
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  event.currentTarget.textContent = show ? "Ocultar" : "Mostrar";
  event.currentTarget.setAttribute("aria-pressed", String(show));
});

form.addEventListener("submit", async (event) => {
  // Impede o envio HTML tradicional, que recarregaria a página e colocaria o fluxo fora deste módulo.
  event.preventDefault();
  // O verificador é calculado de forma assíncrona; um segundo envio não deve criar outro acesso.
  if (submit.disabled) return;
  message.textContent = "";
  // Confirmação é uma prevenção de erro de digitação, não faz parte das credenciais persistidas.
  if (register && password.value !== confirmation.value) {
    message.textContent = "As senhas não coincidem. Confira a confirmação.";
    confirmation.focus();
    return;
  }
  // Bloqueia envio e troca de modo enquanto a operação está em andamento; aria-busy comunica a espera.
  submit.disabled = toggle.disabled = true;
  form.setAttribute("aria-busy", "true");
  submit.textContent = register ? "Criando conta…" : "Entrando…";
  try {
    // Só entra na ficha depois de validar as credenciais e gravar a sessão com sucesso.
    await authenticate(username.value, password.value, register);
    // Remove as senhas dos campos antes de sair da página; não são incluídas na sessão.
    password.value = confirmation.value = "";
    location.replace(SHEET_URL.href);
  } catch (error) {
    // Falta de espaço e bloqueio do navegador precisam de orientação diferente de credenciais inválidas.
    message.textContent =
      error.name === "QuotaExceededError" || error.name === "SecurityError"
        ? "Não foi possível salvar o acesso. Libere o armazenamento deste site no navegador e tente novamente."
        : error.message;
    // Preserva os campos preenchidos e reabilita o formulário para corrigir o problema e tentar outra vez.
    submit.disabled = toggle.disabled = false;
    submit.textContent = register ? "Criar conta e entrar" : "Entrar na ficha";
    form.removeAttribute("aria-busy");
  }
});
