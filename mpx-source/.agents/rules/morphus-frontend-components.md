# Padrão Arquitetural de Componentes Frontend do Morphus

1. **Biblioteca de Componentes Morphus (`src/components/morphus/`)**:
   - Componentes reutilizáveis do ecossistema (usados por `morphus`, `security`, `website` e pelas futuras aplicações criadas pelos usuários) devem ficar em `mpx-frontend/src/components/morphus/<nome-do-componente>/`, no mesmo nível (sem subpastas intermediárias desnecessárias como `/layout`), lado a lado com `src/components/builder-kit/`.
   - Os componentes devem ser desacoplados e orientados a parâmetros (`input()` / `output()`), como `[source]`, para que qualquer aplicação apenas passe os dados e o componente monte seu próprio HTML.

2. **Regra de Ouro: Apenas 1 Componente/Classe por Arquivo + Tríade Obrigatória (`.ts`, `.html`, `.css`)**:
   - **JAMAIS** colocar mais de um componente ou diretiva dentro do mesmo arquivo `.ts` (aquela bagunça de várias classes num único arquivo gigante como no `builder-kit` é expressamente proibida).
   - **Tríade obrigatória**: Todo componente ou subcomponente criado (seja em `src/components/morphus/` ou nas páginas das aplicações) **DEVE SEMPRE** possuir os 3 arquivos separados e vinculados no `@Component`:
     - `<nome>.component.ts`
     - `<nome>.component.html` (`templateUrl: './<nome>.component.html'`)
     - `<nome>.component.css` (`styleUrl: './<nome>.component.css'`)
   - Quando um componente possuir subcomponentes (ex: 4 subcomponentes), podemos ter 4 subpastas dentro da pasta do componente — cada uma com seus próprios `.component.ts`, `.component.html` e `.component.css` — e um único `index.ts` na raiz do componente exportando todo mundo.

3. **Uso Obrigatório de `index.ts` (Barrel Export)**:
   - Toda pasta raiz de componente deve possuir um arquivo `index.ts` exportando o componente e todos os seus subcomponentes (`export * from './...'`).
   - Isso garante que os `imports` nos consumidores fiquem limpos, na mesma linha e sem extensão/sufixo de arquivo (ex: `import { MpxMenuComponent } from '@src/components/morphus/menu';`).

4. **Arquitetura dos 4 Componentes Base de Páginas e 4 Interfaces em `src/apps/core/mpx-base/` (`@core/mpx-base`)**:
   - Todas as classes abstratas base e interfaces ficam centralizadas em `mpx-frontend/src/apps/core/mpx-base/` (importadas via `@core/mpx-base`).
   - Cada interface tem exatamente o mesmo nome da classe abstrata com `I` na frente (`IMorphusComponent`, `IMorphusListComponent`, `IMorphusEditComponent`, `IMorphusNxNComponent`).
   - As entidades de domínio não precisam herdar de uma interface `IMorphusModel` (o genérico `<T>` é livre, suportando tanto entidades com `id` quanto entidades associativas de chave composta):
     1. **`MorphusComponent<T>` + `IMorphusComponent` (Pai de todos os componentes de página)**:
        - `IMorphusComponent` obriga `OnInit` e `OnDestroy` (`ngOnInit` e `ngOnDestroy`).
        - Injeta `Router` e `ActivatedRoute` na base para navegação padronizada.
        - Expõe signals de títulos prontos para o template (`title1`, `title2`, `title3` como `signal<string>('')`).
        - Gerencia inscrições RxJS (`sub1`, `sub2`, `sub3`, `sub4`) com limpeza no `ngOnDestroy`.
        - Define `primaryKeys` (suportando chave simples como `['id']` ou chave composta como `['userId', 'roleId']`), permitindo identificar automaticamente se uma operação é criação ou atualização.
        - Controla **2 níveis de Loading**:
          - **Loading Global** (`loading` signal + métodos de iniciar/parar) para carregamento de página/seção.
          - **Loading por Entidade** (vinculado à instância `T` da linha) para que ações em tabelas (ex: excluir/ativar uma linha) girem o spinner apenas no registro clicado, sem afetar as demais linhas.
     2. **`MorphusListComponent<T>` + `IMorphusListComponent` (Telas de Listagem)**:
        - Herda de `MorphusComponent<T>`.
        - Possui `list = signal<T[]>([])`, `setList(entities: T[])` e `clearList()`.
        - `IMorphusListComponent` obriga os métodos: `loadList(filter?: MorphusFilter): Promise<void>`, `newEntity(): void`, `openFilter(): void`, `onFilter(): Promise<void>`, `onFilterClear(): Promise<void>`, `onFilterClose(): void`.
     3. **`MorphusEditComponent<T, V extends MorphusValidator<T>>` + `IMorphusEditComponent` (Telas de Criação/Edição)**:
        - Herda de `MorphusComponent<T>`, recebendo a entidade `T` e seu validador específico `V`.
        - Gerencia a entidade em edição, o formulário, o validador Fluent API e o estado de salvamento/atualização via `primaryKeys`.
     4. **`MorphusNxNComponent<...>` + `IMorphusNxNComponent` (Telas de Relacionamento Muitos-para-Muitos)**:
        - Herda de `MorphusComponent<T>`, padronizando telas associativas (`UserRole`, `UserClaim`, `RoleClaim`, `CorporationUser`, `WorkspaceUser`, `ApplicationUser`).

5. **Estrutura Padrão de Pastas para Páginas de CRUD (`pages/<entidade>/`)**:
   - Cada CRUD dentro de `pages/<entidade>/` deve seguir exatamente a estrutura:
     - `<entidade>-list/` (`<entidade>-list.component.ts`, `.html`, `.css` -> `extends MorphusListComponent<IEntidade> implements IMorphusList, OnInit, OnDestroy`)
     - `<entidade>-edit/` (`<entidade>-edit.component.ts`, `.html`, `.css` -> `extends MorphusEditComponent<IEntidade, EntidadeValidator> implements IMorphusEdit, OnInit, OnDestroy`)
     - `validators/` (`<entidade>.validator.ts` -> `extends MorphusValidator<IEntidade>`)
     - `<entidade>.routes.ts` (ou `routes.ts`) na raiz da pasta `<entidade>/`.

6. **Motor de Validação Fluent API (`MorphusValidator<T>`) em `src/apps/core/mpx-validators/` (`@core/mpx-validators`)**:
   - O `MorphusValidator<T>` fica isolado em `mpx-frontend/src/apps/core/mpx-validators/` (importado via `@core/mpx-validators`).
   - Todo CRUD possui uma classe `<Entidade>Validator extends MorphusValidator<T>` que implementa `configure(builder: MorphusValidator<T>): void`.
   - Na tela de edição (`<Entidade>EditComponent`), o validador é passado no construtor via `super(<Entidade>Validator)`, onde o `MorphusEditComponent` já o instancia e executa o `configure(...)` automaticamente:
     ```ts
     export class BusinessEditComponent extends MorphusEditComponent<IBusiness, BusinessValidator> implements IMorphusEdit, OnInit, OnDestroy {
       constructor() {
         super(BusinessValidator);
       }
     }
     ```
   - Suporta encadeamento Fluent API (`return this`):
     - `builder.messageForAll()` para regras globais em todos os campos do formulário.
     - `builder.messageFor('<propriedade>')` fortemente tipado nas propriedades de `T` (com autocomplete).
     - `.withError('<erro-padrao>')` para erros nativos tipados (`'required'`, `'email'`, `'minlength'`, `'maxlength'`, `'min'`, `'max'`, `'pattern'`).
     - `.withCustomError('<erro-customizado>')` para erros específicos de negócio ou retornados pela API (ex: `'invalid_email'`, `'exists_email'`).
     - `.showMessage('<mensagem>')` para definir a mensagem exibida abaixo do campo no formulário.
   - Uso no HTML dentro do `<mat-form-field>`:
     ```html
     <mat-error class="morphus-mat-error">
       <span class="morphus-mat-error-label">{{ validator.showErros(fieldRef) }}</span>
     </mat-error>
     ```
