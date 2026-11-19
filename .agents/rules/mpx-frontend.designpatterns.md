# Morphus Frontend — Design Patterns & Coding Standards (`mpx-frontend.designpatterns`)

> [!IMPORTANT]
> **Lei Suprema de Padronização do Frontend Morphus (`mpx-frontend`)**:
> Este documento define a arquitetura oficial, a estrutura de pastas, a fórmula de nomenclatura de arquivos e símbolos, as regras de tipagem/interfaces e o padrão de exportação do Frontend Morphus. Nenhuma classe, componente, rota ou arquivo deve ser criado fora destas diretrizes.

---

## 1. Estrutura Raiz do Projeto (`public/` e `src/`)

Na raiz de `mpx-frontend/` existem exclusivamente **duas pastas de código/ativos** (`public/` e `src/`). Não criar pastas soltas na raiz (como `tools/` ou `assets/`).

### 1.1. Pasta `public/` (Ativos Estáticos Públicos)
A pasta `public/` é a única fonte de ativos estáticos (não existe pasta `assets/` dentro de `public/` nem dentro de `src/`). Todas as subpastas de `public/` utilizam nomes no **plural**:
- `public/brands/` ➔ Identidade visual, papéis de parede (`fundo_web_light.jpg`, `sidebar_dark.jpg`, `topbar_light.jpg`, banners).
- `public/favicons/` ➔ Todos os favicons da aplicação (`favicon.svg`, `favicon.ico`, `favicon-32.png`).
- `public/fonts/` ➔ Fontes tipográficas locais (`Inter`, `Geist Mono`, etc.).
- `public/icons/` ➔ Arquivos `.svg` brutos que são compilados pelo motor `src/core/morphus/icons/compile-icons.mjs` via `npm run icons:build`.
- `public/logos/` ➔ Logotipos oficiais do ecossistema.

### 1.2. Pasta `src/` (Simetria por Fornecedor/Domínio)
As camadas `components/`, `core/` e `styles/` dentro de `src/` seguem **simetria absoluta**, separando o que é nativo do **Morphus (`morphus/`)** do que pertence a bibliotecas/terceiros (`builder-kit/`, `material/`, `tailwindcss/`):

```text
src/
 ├── apps/
 │    ├── app-builder/          ➔ Construtor Visual de Aplicações
 │    ├── morphus/              ➔ Painel Corporativo / Governança Morphus
 │    ├── security/             ➔ Identidade, Autenticação e Autorização
 │    └── website/              ➔ Portal e Catálogo Comercial
 │
 ├── components/
 │    ├── builder-kit/          ➔ Componentes base do BuilderKit
 │    └── morphus/              ➔ Componentes Visuais Oficiais do Morphus
 │
 ├── core/
 │    ├── builder-kit/          ➔ Utilitários de motor do BuilderKit
 │    └── morphus/              ➔ Motor Core Oficial do Morphus
 │
 ├── environments/              ➔ Configurações de ambiente (dev, homolog, prod)
 └── styles/
      ├── base/
      ├── components/
      ├── material/
      ├── morphus/
      ├── tailwindcss/
      └── third-party/
```

---

## 2. Premissa Inegociável: 1 Arquivo = 1 Única Estrutura

- **NUNCA declare duas ou mais classes, interfaces, enums ou componentes dentro do mesmo arquivo.**
- Sempre separe cada estrutura em seu próprio arquivo físico.
- Isso garante que, ao bater o olho no nome do arquivo na árvore do VS Code (e no seu ícone do Material Icon Theme), o desenvolvedor **já saiba exatamente o nome da única estrutura que existe lá dentro sem precisar abrir o arquivo**.

---

## 3. Padrões de Escrita (Casing) e Constantes

### 3.1. Pastas e Nomes de Arquivos Físicos ➔ `kebab-case`
- **100% em letras minúsculas**, com palavras compostas separadas por hífen (`-`).
- **Regra de Ouro**: Nomes de pastas internas de `core/morphus/` e **nomes de arquivos físicos NUNCA começam com `mpx-` ou `morphus-`**. O prefixo `Mpx` pertence exclusivamente ao código (classes, tipos e constantes lá dentro).
  - **Fórmula do Nome do Arquivo**: `<nome-sugestivo>.<objetivo>.<extensao>`
  - *Exemplos de pastas*: `code-editor`, `icon-selector`, `local-storage`, `user-role`
  - *Exemplos de arquivos*: `code-editor.component.ts`, `filter.service.ts`, `filter.builder.ts`, `security.guard.ts`, `application.default.ts`, `corporation.routes.ts`

### 3.2. Classes, Interfaces, Types, Enums e Providers ➔ `PascalCase`
- Primeira letra de cada palavra sempre maiúscula, sem traços ou underlines.
- Toda estrutura pertencente ao motor (`core/morphus`) ou aos componentes compartilhados (`components/morphus`) deve seguir a **Fórmula Matemática 1:1**:
  **`Mpx` + `NomeSugestivo` + `Objetivo`** (ou **`IMpx`** exclusivamente para contratos `.interface.ts`):
  - `popup.component.ts` ➔ `export class MpxPopupComponent`
  - `code-editor.component.ts` ➔ `export class MpxCodeEditorComponent`
  - `edit.component.ts` ➔ `export abstract class MpxEditComponent`
  - `edit.interface.ts` ➔ `export interface IMpxEditComponent`
  - `filter.service.ts` ➔ `export class MpxFilterService`
  - `filter.builder.ts` ➔ `export class MpxFilterBuilder`
  - `validator.ts` ➔ `export abstract class MpxValidator<T>`
  - `cpf.directive.ts` ➔ `export class MpxValidateCpfDirective`
  - `security.guard.ts` ➔ `export const MpxSecurityGuard: CanActivateFn`
  - `onboarding-redirect.guard.ts` ➔ `export const MpxOnboardingRedirectGuard: CanActivateFn`
  - `security.interceptor.ts` ➔ `export const MpxSecurityInterceptor: HttpInterceptorFn`
  - `security.provider.ts` ➔ `export const MpxSecurityProvider`
  - `http-error-code.enum.ts` ➔ `export enum MpxHttpErrorCode`
  - `application.default.ts` ➔ `export const MpxDefaultApplication`
  - `admin-layout.component.ts` ➔ `export class MpxAdminLayout`
  - `landing-layout.component.ts` ➔ `export class MpxLandingLayout`

### 3.3. Variáveis, Propriedades, Parâmetros e Métodos ➔ `camelCase`
- Primeira letra sempre minúscula e demais palavras com inicial maiúscula.
  - *Exemplos*: `filterRows`, `activeWorkspace`, `isAuthenticated`, `loadPrimaryKey()`, `buildFilter()`, `copyKey()`

### 3.4. Constantes Globais do Motor Morphus ➔ `UPPER_SNAKE_CASE` com `MPX_`
- Toda constante global/estática do ecossistema Morphus deve ser escrita em **LETRAS MAIÚSCULAS separadas por `_`** e começar obrigatoriamente com **`MPX_`**:
  - `MPX_ICONS`
  - `MPX_COMPILED_ICONS`
  - `MPX_ALL_ICON_NAMES`
  - `MPX_DEFAULT_EQUAL`, `MPX_DEFAULT_NOT_EQUAL`, `MPX_DEFAULT_LIKE_WITH`, etc.
  - `MPX_EMPTY_GUID`
  - `MPX_SESSION_STORAGE_KEY`
  - `MPX_INSTABILITY_MESSAGE`
- **Observação Importante**: A regra `MPX_` aplica-se **somente a constantes globais do motor Morphus**. Variáveis locais declaradas com `const` dentro de métodos/funções de componentes ou serviços (ex.: `const currentUrl = this.router.url;`, `const maxRetries = 3;`) utilizam `camelCase` normal e **não** levam `MPX_`.

---

## 4. As 6 Categorias de `export interface` (Contratos vs. Objetos e Entidades)

No TypeScript, `export interface` é utilizado tanto para contratos de comportamento quanto para tipagem de objetos de dados. Para diferenciá-los visualmente pelo nome do arquivo (com ícones distintos no VS Code) e pelo nome no código:

| # | Categoria | Sufixo do Arquivo | Começa com `I`? | Padrão do Nome da Interface | Exemplo de Arquivo ➔ Interface |
| :-: | :--- | :--- | :---: | :--- | :--- |
| **1** | **Contrato de Classe** *(usado com `implements`)* | `*.interface.ts` | **SIM (`IMpx*`)** | `IMpx` + `Nome` + `Component` | `edit.interface.ts` ➔ `export interface IMpxEditComponent` |
| **2** | **Espelho 1:1 da Tabela do Banco** | `*.reflected.ts` | **NÃO** | `NomeEntidade` + `Reflected` | `user.reflected.ts` ➔ `export interface UserReflected extends MpxEntity` |
| **3** | **Entidade Completa de Domínio** | `*.entity.ts` | **NÃO** | `NomeEntidade` *(ou `MpxEntity`)* | `user.entity.ts` ➔ `export interface User extends UserReflected` |
| **4** | **Estado Inicial Vazio da Entidade** | `*.empty.ts` | **NÃO** | `NomeEntidade` + `Empty` | `user.empty.ts` ➔ `export interface UserEmpty extends Partial<UserReflected>` |
| **5** | **Objeto Customizado / Modelo do Sistema** | `*.model.ts` | **NÃO** | `Mpx` + `NomeObjeto` | `filter-column.model.ts` ➔ `export interface MpxFilterColumn` |
| **6** | **Payload de Requisição / Resposta da API** | `*.dto.ts` | **NÃO** | `NomePayload` + `Dto` / `Request` / `Response` | `login-request.dto.ts` ➔ `export interface LoginRequest` |

---

## 5. Regras de Componentes Visuais e Layouts

### 5.1. Regra dos 3 Arquivos Obrigatórios por Componente
Todo componente Angular (`@Component`) deve possuir obrigatoriamente seus **3 arquivos separados** (nunca usar template HTML ou estilos inline extensos dentro do `.ts`):
1. `<nome>.component.ts`
2. `<nome>.component.html`
3. `<nome>.component.css`

### 5.2. Padronização de Layouts (`landing` e `admin`)
O ecossistema possui exclusivamente **2 layouts estruturais** dentro de `src/components/morphus/layout/` (não existe layout separado `auth` ou `open` ou `workspace`):
1. **`landing/` (`MpxLandingLayout`)**:
   - Composto por `MpxLandingLayout`, `MpxLandingTopBarComponent` e `MpxLandingContentComponent`.
   - Atende tanto as páginas abertas do Portal (`/website`) quanto o fluxo público de entrada (`/security/signin`, `/security/signup`, `/security/forgot-password`, `/security/onboarding`, `/security/select-corporation`), controlando a exibição da TopBar via input `[showTopBar]`.
2. **`admin/` (`MpxAdminLayout`)**:
   - Composto por `MpxAdminLayout`, `MpxAdminSidebarComponent`, `MpxAdminTopBarComponent` e `MpxAdminContentComponent`.
   - Atende todas as áreas administrativas logadas com Menu Lateral + Barra Superior (`/morphus`, `/security`, `/app`).

### 5.3. Nomenclatura de Domínio: `Security` (Nunca `Auth`)
- Em todo o ecossistema Morphus, o domínio de autenticação, autorização, sessão, guards e interceptors chama-se **`security`** (nunca `auth`).
- Pasta no core: `src/core/morphus/security/` (`MpxSecurity`, `MpxSecurityGuard`, `MpxOnboardingRedirectGuard`, `MpxSecurityInterceptor`, `MpxSecurityProvider`).

---

## 6. Regras de Exportação, Rotas e Barrel Único (`index.ts`)

1. **Exportação Direta na Declaração (Proibido Exportar no Rodapé)**:
   - **PROIBIDO** usar re-exportação ou apelidos (`alias`) na última linha do arquivo (ex.: nunca fazer `export { MpxSecurityProvider as provideSecurity };` no rodapé).
   - Sempre exportar diretamente na assinatura da classe, interface, constante, tipo ou enum (`export class Mpx...`, `export const MPX_...`).
2. **Proibido `export default` em 100% do Projeto**:
   - Nenhum arquivo do projeto (nem componentes, nem páginas, nem arquivos de rotas) pode utilizar `export default`.
   - Toda exportação é nomeada para garantir validação estrita de tipos e refatoração segura (`F2`) pelo compilador TypeScript.
3. **Padrão de Arquivos de Rota (`<nome>.routes.ts`)**:
   - Arquivos de rota **NUNCA** se chamam apenas `routes.ts`. Eles sempre levam o nome do módulo/escopo seguido do objetivo `.routes.ts` (`app.routes.ts`, `morphus.routes.ts`, `security.routes.ts`, `website.routes.ts`, `pages.routes.ts`, `landing.routes.ts`, `corporation.routes.ts`, `workspace.routes.ts`, `user.routes.ts`, etc.).
   - Dentro de cada `*.routes.ts`, exportar diretamente no topo:
     ```ts
     export const routes: Routes = [ ... ];
     ```
   - E no lazy loading (`loadChildren` / `loadComponent`), referenciar explicitamente o membro tipado:
     ```ts
     loadChildren: () => import('@morphus/pages/corporation/corporation.routes').then((m) => m.routes),
     ```
4. **Barrel Único em `src/core/morphus/index.ts` (Zero Re-exports Exilados)**:
   - **PROIBIDO** criar arquivos exilados que apenas re-exportam tipos de outra pasta.
   - Dentro de `src/core/morphus/`, existe **APENAS UM ÚNICO `index.ts` na raiz (`src/core/morphus/index.ts`)** que exporta todo o motor. As subpastas internas de `core/morphus/` (`base/`, `default/`, `filter/`, `http/`, `security/`, etc.) **não possuem `index.ts` próprios**.
   - Dessa forma, o IntelliSense do VS Code sugere sempre **1 único caminho oficial** para todo o motor:
     ```ts
     import {
       IMpxEditComponent,
       MpxDefaultApplication,
       MpxEditComponent,
       MpxEditShared,
       MpxFilter,
       MpxSecurity,
     } from '@core/morphus';
     ```
