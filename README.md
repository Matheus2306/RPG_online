# RPG_online

Ficha digital de Oblívio RPG com HTML, CSS e JavaScript nativo separados por responsabilidade.

## Executar

Sirva a pasta por HTTP e abra `index.html`, que encaminha para `pages/`. No VS Code, use **Open with Live Server** no arquivo de entrada. Os módulos JavaScript precisam de HTTP; abrir diretamente por `file://` não é suportado. Não há instalação de dependências nem etapa de build.

## Organização

| Caminho | Responsabilidade |
| --- | --- |
| `pages/index.html` | Estrutura completa da ficha. |
| `CSS/style.css` | Estilos e identidade visual da ficha original. |
| `Js/global.js` | Entrada da aplicação. |
| `Js/core/` | Inicialização, estado compartilhado e compatibilidade dos eventos do HTML. |
| `Js/rules/` | Catálogos e cálculos das regras. |
| `Js/character/` | Persona, escolhas, foto e anotações. |
| `Js/combat/` | Combate e Estresse. |
| `Js/inventory/` | Inventário e equipamentos. |
| `Js/dice/` | Rolagens, bandeja e histórico. |
| `Js/macros/` | Edição e execução de macros. |
| `Js/ui/` | Atualização da interface, guias e acessibilidade. |
| `Js/storage/` | Persistência e backup das fichas. |
| `Js/utils/` | Seletores `$` e `$$`, escape de HTML e utilitários compartilhados. |

`global.js` importa `core/app.js`. A inicialização recupera a ficha mais recente, constrói os controles e sincroniza a interface. Cada contexto altera o estado compartilhado e solicita atualização ou salvamento conforme sua responsabilidade. Os eventos inline existentes são expostos por `core/legacy-handlers.js`.

As fichas são salvas neste navegador com a chave `oblivio-fichas-v1`; as preferências de acessibilidade usam `oblivio-acessibilidade-v1`. Exporte backups para transportar os dados. A integração opcional com conta depende de `window.claude`; os dados 3D dependem do carregamento do Three.js e mantêm a alternativa 2D.

Base de origem: [FICHA_OBLIVIO](https://github.com/tiago30072004-spec/FICHA_OBLIVIO).
