# Ficha Oblívio RPG

Ficha digital de personagens de Oblívio RPG, executada no navegador. Permite cadastrar várias Personas, escolher um Papel, ajustar atributos, administrar Estresse e inventário, selecionar conhecimentos e habilidades, registrar notas e realizar rolagens.

## Como abrir

Sirva esta pasta por HTTP e abra `/` (ou `index.html`). No VS Code, por exemplo, use **Open with Live Server** em `index.html`. Sem sessão, a entrada redireciona para `/pages/login/`; após autenticar, abre a ficha em `/pages/`. A página usa módulos JavaScript nativos (`type="module"`); abrir por `file://` não é suportado. Use **localhost ou HTTPS**, necessários à API de derivação de senhas. Não há etapa de build ou instalação de dependências para a aplicação.

## GitHub Pages

Os endereços são relativos à raiz da aplicação, calculada a partir de `Js/auth/session.js`. Assim, a mesma pasta funciona em `http://localhost:porta/` e em `https://usuario.github.io/RPG_online/`: entrada, login e ficha preservam o prefixo do projeto. No Pages, o fluxo usa `/RPG_online/pages/login/` e `/RPG_online/pages/`, inclusive ao sair ou abrir a ficha sem sessão.

Ao adicionar links ou recursos locais, evite começar o caminho com `/`, pois isso aponta para a raiz do domínio e remove o prefixo do repositório. Para redirecionamentos da sessão, reutilize `LOGIN_URL` e `SHEET_URL`. Mantenha a capitalização dos nomes das pastas e arquivos.

## Acesso local

- Na primeira visita, escolha **Criar uma conta local**, informe usuário e senha de 8 a 128 caracteres e confirme a senha. As próximas visitas permitem entrar com esses dados.
- A sessão dura sete dias e persiste ao recarregar ou reabrir o navegador. **Sair** salva a ficha atual e encerra a sessão; abas abertas verificam saída, troca de conta e expiração.
- O endereço direto `pages/index.html` também exige sessão antes de montar os componentes, inicializar ou exibir a ficha.
- `oblivio-contas-v1` guarda usuários, salt aleatório e verificadores PBKDF2/SHA-256 (600.000 iterações), sem senhas em texto puro. `oblivio-sessao-v1` guarda a conta ativa e a expiração.
- A primeira conta criada assume as fichas antigas na chave `oblivio-fichas-v1`, preservando os dados. As demais usam `oblivio-fichas-v1:<id da conta>`. Preferências de acessibilidade continuam compartilhadas no aparelho.
- Login e fichas existem apenas neste navegador e nesta origem. Limpar os dados do site remove contas e fichas; exporte os backups das Personas. Não há recuperação de senha ou sincronização de contas.
- Trata-se de controle de navegação no cliente: quem tem acesso ao navegador pode alterar o `localStorage` ou o código. Dados sensíveis e autorização real exigem autenticação em servidor.
- A integração automática com `window.claude` fica desativada no fluxo local para não misturar fichas de contas locais com uma identidade externa diferente.

O contexto `Js/auth/` concentra sessão e credenciais (`session.js`), entrada (`entry.js`), formulário (`login.js`) e ciclo de vida da página protegida (`protected-page.js`). O HTML está em `pages/login/index.html` e os estilos específicos em `CSS/auth/login.css`, reutilizando os tokens da ficha.

Execute `node --test tests/auth.test.mjs` com Node.js 22 ou superior para verificar autenticação, expiração, cadastro duplicado, preservação das fichas anteriores e falhas de armazenamento. Para validar no navegador: abrir `/` sem sessão, tentar o endereço direto da ficha, criar conta, salvar uma Persona, recarregar, sair, tentar senha incorreta e criar outra conta para conferir o isolamento.

## Organização do JavaScript

Os módulos estão agrupados por contexto: `core` (inicialização e estado), `rules` (regras e cálculos), `character` (Persona, foto, escolhas e notas), `combat` (combate e Estresse), `inventory` (equipamentos), `dice` (rolagens e histórico), `macros` (automação), `ui` (interface e acessibilidade) e `storage` (persistência). O ponto de entrada continua em `Js/global.js`. Os utilitários compartilhados ficam em `Js/utils/utils.js`.

## Componentes de apresentação

`pages/index.html` define a estrutura da página, suas colunas e marcadores `<template id="mount-…">`. Após validar a sessão, `core/sheet-page.js` substitui cada marcador pelo componente correspondente. Só então `core/app.js` registra os eventos e recupera os dados. Não há Shadow DOM, framework ou etapa de compilação: os componentes produzem os mesmos elementos HTML nativos e usam o CSS existente.

O ajuste responsivo do cabeçalho fica em `CSS/ui/sheet-header.css`, limitado à classe `.sheet-header` para não afetar outros agrupamentos da aplicação.

| Componente em `Js/` | Responsabilidade |
| --- | --- |
| `ui/components/card.js` | Cartão com título, indicador opcional, classes e conteúdo. |
| `ui/components/disclosure.js` | Menu ou ajuda expansível com `details` e `summary` nativos. |
| `ui/components/tabs.js` | Seletores de abas que mantêm o contrato de `ui/guides.js`. |
| `ui/components/sheet-header.js` | Ações da ficha, menus de acessibilidade e saída. |
| `character/components/persona-card.js` | Foto, identificação, Papel e aparência da Persona. |
| `character/components/attributes-card.js` | Atributos e explicação dos cálculos. |
| `combat/components/stress-panel.js` | Regiões de Estresse e Fora de Ação. |
| `ui/components/character-panels.js` | Composição de inventário, conhecimentos, mazelas, notas e habilidades. |
| `ui/components/action-dock.js` | Composição dos atalhos de combate, cura e macros. |
| `storage/components/backup-panel.js` | Importação e exportação da ficha. |
| `dice/components/dice-panel.js` | Bandeja, histórico e área de animação dos dados. |

Para reutilizar um cartão em outro componente:

```js
import { card } from '../../ui/components/card.js';

return card({
  id: 'meu-painel',
  title: 'Meu painel',
  statusId: 'meu-indicador', // opcional; permite atualizar um valor no título
  content: '<p>Conteúdo do componente.</p>',
});
```

`title` e os atributos são escapados pelos componentes compartilhados. `content` é reservado a templates internos: nunca interpole texto do usuário nele sem usar `esc()` de `Js/utils/utils.js`. Cada instância precisa de IDs únicos. Para acrescentar um bloco à página, crie o marcador e registre a função de apresentação em `sheetComponents`, mantendo as regras de negócio no contexto existente.

Execute `node --test tests/*.test.mjs` para verificar autenticação, IDs e marcadores de montagem, ligação entre abas e painéis e escape de textos dos componentes compartilhados.

| Arquivo em `Js/` | Responsabilidade |
| --- | --- |
| `global.js` | Valida a sessão, monta os componentes e carrega `app.js`. |
| `core/sheet-page.js` | Compõe a página a partir dos componentes dos contextos, antes dos eventos e cálculos. |
| `core/app.js` | Inicializa acessibilidade, bandeja de dados e interface; recupera a ficha mais recente da conta local. |
| `rules/data.js` | Catálogos de atributos, Papéis, conhecimentos, habilidades, mazelas, fardos e equipamentos. |
| `core/state.js` | Cria a ficha padrão com `blank()` e centraliza a ficha atual em `state.sheet` e o histórico em `state.history`. |
| `utils/utils.js` | Seleção de elementos, arredondamento, sorteio de dados, limites numéricos, alternância em listas, escape de HTML e conversão de callbacks em promessas. |
| `rules/calculations.js` | Calcula Fôlego, Dano, Coragem, Proteção, Velocidade, limite total de Estresse, espaços de inventário e quantidade de especializações. |
| `combat/combat.js` | Testes de conhecimento, classificação dos resultados, ataques por região e rolagens de dano. |
| `combat/stress.js` | Aplica e recupera Estresse, distribui limites, registra Fora de Ação e aumenta o nível. |
| `inventory/inventory.js` | Adiciona itens, verifica requisitos, altera equipamento, modificações e usos, e remove itens. |
| `character/selections.js` | Alterna escolhas nas listas da ficha e solicita atualização da tela. |
| `character/persona.js` | Papéis, emblemas SVG, estatísticas da Persona e decoração visual por Papel. |
| `character/photo.js` | Carrega e redimensiona a foto, controla arraste, zoom, enquadramento e remoção. |
| `ui/guides.js` | Renderiza descrições de conhecimentos e mazelas, controla sub-abas e cliques delegados. |
| `ui/ui.js` | Constrói campos e ouvintes com `build()`, sincroniza campos com `sync()` e redesenha os valores com `upd()`. Também controla dificuldade e abertura de painéis. |
| `storage/storage.js` | Salvamento automático e manual, seleção/criação/exclusão de fichas, importação/exportação JSON e integração opcional de conta. |
| `character/notes.js` | Gerencia páginas de anotações, títulos, conteúdo e seleção da página atual. |
| `dice/dice.js` | Bandeja de dados, animações SVG 2D e renderização 3D opcional com Three.js. |
| `dice/history.js` | Registra resultados e controla o painel de histórico. |
| `macros/macros.js` | Cria, edita e executa comandos sequenciais de ataque, dano, dados, cura, Estresse, Coragem, dificuldade e mensagens. |
| `ui/accessibility.js` | Zoom, fonte legível, contraste, espaçamento, controles maiores e redução de efeitos. |
| `core/legacy-handlers.js` | Expõe no `window` a API necessária aos eventos inline já presentes no HTML e nos templates. |

## Como o código funciona

1. O HTML carrega `global.js`, que valida a sessão e monta os componentes de `sheet-page.js` antes de importar `app.js`. Isso garante que os elementos existam antes da inicialização e que a ficha não seja montada sem autenticação.
2. `blank()` fornece os valores iniciais. A aplicação recupera a ficha salva mais recentemente, se houver, e a coloca em `state.sheet`.
3. `build()` cria os controles e registra os eventos. `sync()` copia a ficha para os campos e chama `upd()`.
4. Uma interação altera `state.sheet`. As funções de cada responsabilidade cuidam da operação e chamam `upd()` ou `scheduleSave()`, conforme necessário.
5. `upd()` consulta `D()`, recalcula os valores derivados e atualiza Persona, atributos, Estresse, conhecimentos, habilidades, armas, inventário e mazelas.
6. `scheduleSave()` espera 600 ms desde a última alteração antes de chamar `persist()`. O JSON é salvo no `localStorage` com a chave original `oblivio-fichas-v1`. As preferências de acessibilidade usam uma chave separada, `oblivio-acessibilidade-v1`.
7. As rolagens sorteiam os resultados primeiro, exibem a animação e então registram o resultado. As macros aguardam cada comando assíncrono antes de executar o próximo e não executam JavaScript arbitrário.

### Principais regras implementadas

As divisões por dois abaixo arredondam para baixo.

| Valor | Cálculo |
| --- | --- |
| Fôlego | `(Carne + Determinação) / 2` |
| Dano | `(Força + atributo escolhido para dano) / 2` |
| Coragem | `(Determinação + Mente) / 2`, com ajuste da ficha e mínimo zero |
| Proteção | `(Carne + Fuga) / 2 + bônus dos itens equipados` |
| Velocidade | `(Fuga + Determinação) / 2` |
| Limite total de Estresse | `Estresse base do Papel + Carne + bônus acumulado` |
| Espaços de inventário | `5 + máximo entre 1 e o atributo escolhido para inventário` |
| Quantidade de especializações | `3 + metade de Mente` |

Os testes usam d20. As dificuldades Reduzida, Normal e Aumentada exigem respectivamente 10, 13 e 16. Um 1 natural gera Falha Extrema; um 20 natural ou total de pelo menos 20 gera Sucesso Extremo. No ataque, sucessos acumulam pontos e falhas podem gerar Estresse nas regiões arriscadas. O excesso de Estresse de um membro transborda para o Torso, respeitando seu limite.

## Compatibilidade e limites

- O formato das fichas, as chaves de armazenamento e as regras foram preservados nesta divisão.
- Os módulos usam imports explícitos. O estado é compartilhado; ainda existem dependências em ambos os sentidos entre atualização da interface e ações da ficha. A separação não equivale a uma arquitetura completamente desacoplada.
- Os handlers inline foram mantidos por compatibilidade. `legacy-handlers.js` é a ponte explícita entre eles e os módulos.
- As fichas ficam neste navegador. O código legado de integração com `window.claude` permanece disponível em `storage.js`, mas não é conectado automaticamente pelo fluxo de contas locais.
- O download de JSON mantém a integração anterior com `claude.use("downloads")`. Sem ela, o código disponibiliza o JSON na caixa de backup para copiar.
- Three.js é carregado sob demanda de um CDN. O código mantém o caminho alternativo de rolagem 2D quando o 3D não está disponível.
- O histórico de rolagens fica em memória e não faz parte do backup da ficha.

## Verificação da refatoração

Foram verificadas a sintaxe dos arquivos, a resolução do grafo de 21 módulos, a API de compatibilidade e os caminhos locais do HTML. Verificações locais com armazenamento e elementos simulados cobriram cálculos derivados, dificuldades, resultados extremos, dados, transbordamento e cura de Estresse, expressões de macros e gravação JSON usando a chave existente.

A verificação visual em navegador ficou pendente porque a ferramenta de navegador bloqueou o acesso ao servidor local. As verificações locais não validam layout, gestos da foto, WebGL ou as integrações externas.
