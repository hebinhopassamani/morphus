---
trigger: always_on
description: Ideias futuras, visões de produto e módulos planejados para o ecossistema Morphus.
---

# Ideias Futuras & Roadmap do Ecossistema Morphus

> [!IMPORTANT]
> **LEI SUPREMA DE EXECUÇÃO ("Rumo Final por Fase — Código Acima de Ideias Infinitas")**:
> - **Todo desenvolvimento sem um Rumo Final (linha de chegada clara e escopo fechado) fracassa.** Se ficarmos apenas expandindo ideias ao infinito, teremos apenas textos e nenhum produto finalizado.
> - **Papel do Agente**: Sempre proteger o foco do Arquiteto. Quando novas ideias surgirem, anote-as neste roadmap para não se perderem, mas **mantenha a execução de código 100% travada na Fase Atual até a linha de chegada**.
> - **Fase 1 (Escopo Fechado — Nosso Rumo Final Atual)**:
>   1. **Empresas e Estrutura Base**: `Corporations`, `Workspaces`, `Applications`, `Modules` e `SubModules`;
>   2. **Controle de Funcionários e Segurança**: `Users`, `Roles` (Perfis) e `Permissions/Claims` (Permissões);
>   3. **Propósito Operacional Central**: **Notas Fiscais** e **Contas a Pagar** — **e PONTO FINAL!**
> - **Fase 2 em diante**: Só iniciam em código após a Fase 1 estar 100% concluída e entregue, definindo-se também um novo rumo final fechado para a Fase 2.

## 1. Morphus Flow (Motor de Workflow Genérico e Configurável — Inspirado no WeWeb)
- **Conceito**: Aplicativo/Módulo de fluxo de trabalho 100% configurável, genérico e Multi-Tenant (`CorporationId`), com **interface visual de nós, gatilhos (Triggers), ramificações condicionais (`True/False` / `Switch`), variáveis de contexto, loops e inspetor lateral de payload inspirado no editor de Workflows do WeWeb**.
- **Funcionamento**:
  - Capaz de carregar e transportar **qualquer objeto/entidade** (ou coleção de objetos) da corporação contratante através de fluxos pré-montados e configurados.
  - Composto por etapas/nós encadeados onde cada etapa recebe o(s) objeto(s), executa suas tarefas/regras de negócio (aprovações, validações, mutações, integrações, notificações por e-mail, tarefas humanas ou ações de IA) e passa o fluxo adiante para a próxima etapa.
  - **Cenário Real de Referência (Nota Fiscal -> Contas a Pagar)**:
    1. Funcionário dá entrada na Nota Fiscal, que entra automaticamente como objeto no fluxo configurável.
    2. **Roteamento condicional**: Segue para o Administrativo por padrão, ou desvia automaticamente para a Diretoria caso o valor seja maior que `R$ X`.
    3. **Decisão**: O responsável aprova ou rejeita; a Nota Fiscal viaja junto dentro do envelope do fluxo.
    4. **Desfecho automatizado**: Ao ser aprovada, cai no Contas a Pagar, onde com apenas 1 clique o sistema extrai o objeto Nota Fiscal de dentro do fluxo e já lança valores, datas, CNPJ e parcelas em menos de 5 minutos.
  - Integrado nativamente à hierarquia `Corporation -> Workspace -> Application -> Module`.

## 2. Biblioteca de Ícones Coloridos e Animados para Corporações / Aplicações
- **Conceito**: Permitir a escolha a dedo de ícones ricos (incluindo ícones coloridos e animados) para identificar visualmente Corporações, Workspaces, Aplicações e Menus no Morphus.

## 3. Morphus Identity / Security API Aberta (`Security.Api` — Nosso próprio Auth0 e Governança Universal)
- **Lei Arquitetural Obrigatória no Desenvolvimento (`Morphus` = Host / Master Tenant)**:
  - O próprio **Morphus** é o **Host Tenant (Master Tenant / Corporação Raiz)** que governa todo o ecossistema no topo da árvore (`ParentCorporationId = null`), e todas as empresas clientes entram como Tenants abaixo dele.
  - **Não é apenas o `morphus-mail`**: **TODAS as aplicações do ecossistema** (`Website`, `Morphus`, `Morphus Mail`, `Morphus Flow` e **todas as aplicações que os próprios clientes/usuários vão criar**) são 100% controladas pela **`Security.Api`**!
  - Isso já nasce como uma **obrigação/padrão de desenvolvimento desde o primeiro dia**: nenhuma aplicação (interna ou externa) acessa tabelas de segurança diretamente; todas nascem consumindo a `Security.Api` como provedor único de Identidade, Autenticação e Autorização.
- **Conceito**: Expor o motor de autenticação e autorização Multi-Tenant do Morphus (`Corporation -> Workspace -> Application -> Module -> SubModule -> Roles & Claims -> Secret Keys`) em uma **API dedicada e independente (`Security.Api`)**, funcionando exatamente como um **Auth0**.
- **Como funciona por trás das cortinas (Orquestração e Isolamento Total entre Aplicações)**:
  1. **Isolamento Absoluto de Banco de Dados — Lógico E Físico no PostgreSQL (Regra de Ouro)**:
     - O `morphus-mail` (`Mail.Api`) — assim como qualquer outra aplicação satélite — **NÃO tem acesso direto às tabelas de segurança no banco de dados**! Ele só enxerga as tabelas do seu próprio negócio (e-mails, templates, domínios). Quem tem acesso às tabelas de Segurança (`Corporations`, `Users`, `Roles`, `Permissions`, `SecretKeys`) é **exclusivamente a `Security.Api`**!
     - **Isolamento Físico no PostgreSQL (Decidir antes de o banco crescer)**:
       - **Abordagem A (Databases Separados no mesmo Container Postgres)**: `morphus_security`, `morphus_mail`, `morphus_erp`. No Postgres, um database é 100% isolado fisicamente do outro (nem `JOIN` nem `SELECT` cruzado existe), e não gasta memória extra porque rodam na mesma instância do container `db`.
       - **Abordagem B (Schemas Separados + Usuários do Postgres com Permissão Restrita)**: `schema security` (acessível apenas pelo usuário `usr_security` da `Security.Api`) e `schema mail` (acessível apenas pelo usuário `usr_mail` da `Mail.Api`), configurado no EF Core com `modelBuilder.HasDefaultSchema(...)`. Se a `Mail.Api` tentar ler uma tabela de `security`, o próprio PostgreSQL bloqueia com `permission denied for schema security`!
  2. **Transparente na Interface do Cliente**: Quando o cliente entra no site do `morphus-mail` e cria um Perfil (`Role`), um Usuário, uma Permissão e vincula um ao outro (ou gera uma `Secret Key`), o `morphus-mail` não grava nada em tabela de segurança: ele **pede via requisição para quem tem o acesso (`Security.Api`)**!
  3. **Validação Server-to-Server (`Mail.Api` -> `Security.Api`)**: Quando o sistema do cliente chama a **`Mail.Api`** para disparar um e-mail, a `Mail.Api` **não envia nada sem antes consultar a `Security.Api`** para validar aquela `Secret Key` / Token, identificar a `CorporationId` e checar as permissões/roles.
  4. **Pronta para o Mercado como SaaS (Estilo Auth0 / Firebase SDK via `Key` Única)**:
     - Todas as entidades do Morphus herdam `Key` (12 caracteres únicos gerados por GUID, com índice `UNIQUE` no banco e cópia em 1 clique nas telas de edição via `MorphusEditComponent.copyKey()`).
     - Quando o cliente cria uma `Application`, `Module`, `SubModule`, `Role` ou `Claim` no painel, ele simplesmente clica na `Key` para copiá-la e usa direto no SDK (`Morphus.Security.Sdk` / `@morphus/security`) ou no futuro `AppBuilder`, permitindo que a `Security.Api` valide permissões e operações dinamicamente pela `Key` sem precisar criar Controllers físicos ou alterar código no `CrossCutting`!
  5. **Visão Completa do Painel `/security` (`Morphus Security` — Auth0 Enterprise Completo)**:
     - Mesma estrutura visual de Workspace (`MorphusWorkspaceLayout` + Sidebar + Dashboard estilo Fuse com nomenclatura de Identidade & Segurança).
     - **Escopo da Fase 1 no `/security`**: `Users`, `Roles`, `Claims` (`user-role`) e `Modules & SubModules` (`module`).
     - **Módulos Futuros do `/security` (Roadmap Auth0)**:
       - `API Keys` / `APIs` (Chaves de API e escopos server-to-server)
       - `Access Control` (Políticas avançadas de acesso)
       - `Attack Protection` (Rate limit, brute-force protection, suspicious IP throttling)
       - `Multi-Factor Auth (MFA)` (TOTP, SMS, Email, WebAuthn/Passkeys)
       - `Social Authentication` (Google, GitHub, Microsoft, Apple)
       - `SSO Integration` (SAML, OIDC, Active Directory / Entra ID)
       - `How to Authenticate` (Quickstarts interativos e snippets de SDK por linguagem)
       - `Monitoring`, `Security Logs` e `Webhooks` de eventos de segurança.

## 4. Morphus Mail (SaaS de Disparo de E-mails + Painel + SDK no NPM estilo Resend/SendGrid)
- **Conceito**: Transformar a estrutura de tabelas de e-mail e o motor `EmailHandler` (que já estão prontos) em um produto SaaS completo de envio de e-mails transacionais dentro do ecossistema Morphus.
- **Fluxo Integrado (`morphus-mail` + `Mail.Api` + `Security.Api`)**:
  - **Na Interface (`src/apps/morphus-mail`)**: O cliente se cadastra e tem acesso a gerar `Secret Key`, criar `Roles` e `Permissões` (que por trás dos panos são processadas pela **`Security.Api`**), além de gerenciar seus **Domínios**, **Templates HTML** e **Playground de Envio** (processados pela **`Mail.Api`**).
  - **No Disparo (`Mail.Api` consultando `Security.Api`)**: A API de e-mail recebe o pedido do SDK, valida o token/chave junto à **`Security.Api`** e só então executa o disparo.
- **Arquitetura em 3 Pontas**:
  1. **Quarta Sub-Aplicação no Front-end (`src/apps/morphus-mail`)**:
     - Painel focado exclusivamente no domínio de E-mails (já autenticado e autorizado pela `Security`), onde o cliente gerencia seus **Domínios**, cadastra **Templates HTML**, visualiza **Secret Keys / Logs** e usa a **tela de Playground / Envio Direto** para testar disparos em seu nome na hora.
  2. **5º Projeto no Back-end C# (API dedicada do Morphus Mail)**:
     - Endpoint de alta performance em C# para receber, autenticar (via `Secret Key`) e processar as chamadas de envio do `morphus-mail`.
  3. **SDKs / Bibliotecas Oficiais Multi-Linguagem + Seletor Interativo de Snippets (`morphus-mail`)**:
     - **Ecossistema JS/TS (`npm install morphus-mail`)**: Compatível com **Angular**, **React**, **Node.js** e **Vanilla JS/TS**. Reaproveita as interfaces TypeScript já tipadas (`Email`, `EmailFrom`, `EmailTo`, `EmailCc`, `EmailBcc`) e expõe a mesma **Interface Fluente** do C# (`addMailFrom()`, `addMailTo()`, `addMailCc()`, `sendMail()`).
     - **Outras Linguagens & Plataforma Universal (`Sending Email API`)**: Suporte e pacotes/exemplos prontos para **Node.js, Angular, React, .NET (C# / NuGet), Python, PHP, Go, Rust, Ruby, Java e cURL (REST Genérico)**.
     - **Seletor de Código no Painel (`morphus-mail`)**: Na própria interface administrativa do `morphus-mail`, exibir as abas com todas essas linguagens (com barra de rolagem horizontal/abas perfeitas!) onde o cliente clica na linguagem dele e já copia o trecho de código pronto com a `Secret Key` dele injetada!
  4. **Verificação de Domínio Próprio do Cliente (`Domains -> Verified` — SPF, DKIM e DMARC)**:
     - **Como funciona na tela (`+ Add Domain`)**:
       1. O cliente cadastra o domínio dele (ex.: `cliente.com.br`) no painel `morphus-mail`.
       2. O back-end C# gera um par de chaves RSA (2048 bits) para o **DKIM**: salva a **Chave Privada** no PostgreSQL e exibe a **Chave Pública** na tela para o cliente colar no DNS dele (junto com a linha do **SPF** `TXT`).
       3. **Botão "Verify" (Verificação de DNS em C#)**: Usa o pacote `DnsClient.NET` no C# para consultar em tempo real os registros `TXT` / `CNAME` do domínio do cliente. Quando encontra os registros corretos, muda o status para **`Verified`**!
       4. **Disparo Autenticado em Nome do Cliente (2 Abordagens possíveis)**:
          - **Abordagem Nativa (`MimeKit.Cryptography.DkimSigner`)**: O próprio `MimeKit` (já usado no `EmailHandler`) assina digitalmente cada `MimeMessage` com a chave privada DKIM daquele domínio antes de entregar ao servidor SMTP/Relay.
          - **Abordagem White-Label (O segredo da Resend com AWS SES)**: A API C# se comunica por trás dos panos com o SDK da AWS SES (`CreateEmailIdentity`), exibe os tokens DNS na tela do `morphus-mail` com a identidade visual do Morphus e utiliza a reputação de IPs da Amazon pagando frações de centavo por milheiro.

## 5. Catálogo de Aplicações Comercializáveis & Provisionamento Sob Demanda (Ex.: `Kalupa` — Teste Grátis 14 Dias)
- **O Que é o Kalupa (Proposta de Valor & Agnosticismo de Editor)**:
  - O **Kalupa** não tenta reinventar editores de texto: ele é um **Motor Inteligente e Invisível de Estruturação de Conhecimento** governado pelo **Morphus**.
  - **Fluxo de Trabalho**:
    1. Captura o conteúdo bruto do usuário silenciosamente e envia para o Agente de IA;
    2. Formata o documento completo seguindo **os templates personalizados do próprio usuário** ou **os templates oficiais do Kalupa**, gerando também um **Resumo** para o usuário **aprovar ou rejeitar** antes de consolidar na sua base de conhecimento;
    3. **Entrega Invisível na Pasta Local (`Kalupa Sync Service`)**: Um serviço leve instalado na máquina do usuário busca automaticamente os documentos aprovados (`sincronizado = false`) respeitando as permissões da `Security.Api` (`Leitura`/`Escrita`) e os entrega direto na pasta local escolhida pelo cliente.
    4. **Liberdade Total de Editor**: O cliente usa a ferramenta que preferir para ler/editar os arquivos entregues na pasta dele (**Obsidian**, **VS Code**, **Typora**, **LibreOffice**, **Word**, ou direto pelo **Windows Explorer**).
- **Regra de Negócio no Cadastro Inicial**:
  - Aplicações comerciais como o **Kalupa** (`kalupa.io`), **Morphus Mail** e **Morphus Flow** **NÃO são vinculadas automaticamente** no momento em que o usuário cria sua conta inicial no Morphus (no `MorphusAccountSeed` entram apenas as 3 aplicações base do sistema: `Morphus`, `Segurança` e `Website`).
- **Fluxo de Contratação / Trial ("Teste Grátis por 14 Dias")**:
  - O cliente visualiza o produto (no painel/loja de aplicações do Morphus ou na página do produto) e clica em **"Teste Grátis por 14 dias"** (ou Contratar).
  - **Só nesse momento (Sob Demanda)** o sistema executa o provisionamento daquela aplicação para a `CorporationId` do cliente:
    1. Vincula/cria a `Application` (`Kalupa`) no Workspace da empresa controlando o período de avaliação (14 dias);
    2. Cria os **Módulos e Submódulos** específicos da aplicação (ex.: Documentos no Kalupa);
    3. Cria os **Perfis (`Roles`)** e **Permissões (`Claims`: Leitura, Escrita, etc.)** daquela aplicação;
    4. Libera o acesso para os usuários da empresa em `ApplicationUsers`.
- **Auditoria, Comercialização e Rastreabilidade ("Como, Quando, Por Que e Quem Fez")**:
  - Além das tabelas de vínculo (`corporation_users`, `workspace_users`, `application_users`), todo provisionamento, alteração de permissão, início/fim de trial, upgrade/downgrade e ação crítica deve ter **log de auditoria completo** (`Quem fez`, `Quando`, `Como`, `Por que / Origem` e `Payload Anterior/Novo`).

## 6. Governança de Layouts, Telas, Cotas de E-mail e Motor de Webhooks
- **Visão Completa do Painel `/morphus` (`Morphus Platform & Workspace Hub`)**:
  - `Organization` (`Corporations` / Matriz e Filiais)
  - `Workspaces`
  - `Applications`, `My Applications` & `Application Templates / Models` (Catálogo, Aplicações contratadas/criadas e Modelos/Templates prontos para clonar e criar uma nova aplicação a partir deles)
  - `My Forms`, `My Pages` & `Code Components` (AppBuilder / Telas, Formulários dinâmicos e Componentes de Código reutilizáveis da corporação)
  - `Application Profiles` (Perfis e configurações por aplicação)
  - `Workflows` (`Morphus Flow` — fluxos de trabalho configuráveis da corporação)
  - `Agents` (Agentes de IA da corporação — orquestração, prompts, ferramentas e automações inteligentes)
  - `Plugins`, `Webhooks` & `Integrations` (Extensões, conectores e eventos de negócio)
  - `Domains`, `Emails`, `Email Templates`, `Email Settings` (Governança de comunicação e SMTP/Domínios)
  - `Plans & Billing` (Planos, assinaturas, trials e faturamento da corporação)
  - `Monitoring` & `System Logs` (Observabilidade e auditoria operacional da corporação).
- **Layouts e Comportamento de Telas no Banco de Dados**:
  - Definir e cadastrar no banco de dados **quais layouts** existem (`Default`, `Clean`, `Enterprise`, `Mail`, etc.) e qual layout/comportamento cada `Application`, `Module` ou `SubModule` (tela) utiliza, permitindo que o front-end resolva dinamicamente a casca visual e o comportamento da tela a partir dos metadados vindos da API.
- **Camuflagem Visual No-Code para Usuário Leigo no AppBuilder (Sobre o Motor HTML)**:
  - A base técnica (`HTML + data-mpx-* + {{variavel}}`) já resolve para desenvolvedores/técnicos, mas para o **usuário 100% leigo**, o sistema vai **camuflar o código por trás de uma interface visual clicável no próprio Preview**:
    1. O usuário clica direto em cima do Card de KPI, da Tabela ou do Campo de Formulário no Preview;
    2. Abre uma caixinha simples em português claro (*"O que você quer mostrar aqui?"* -> Combo: `Total de Contas a Pagar`, `Quantidade de Notas Fiscais`, etc.; ou *"Este campo é obrigatório?"* -> Chave Liga/Desliga);
    3. Por trás dos panos, o próprio Morphus escreve/atualiza o `{{ ... }}` e o `data-mpx-*` no HTML sem o usuário leigo jamais precisar ver uma chave `{{ }}` ou tag HTML se não quiser!
- **Governança e Cotas de Envio de E-mail**:
  - Controlar rigorosamente **quem pode enviar e-mails** (quais `Corporations`, `Applications`, `Users`, `Roles` ou `SecretKeys`), **como** pode enviar (via SMTP próprio, relay do Morphus, template obrigatório ou HTML livre) e **quantos e-mails pode enviar** (cotas diárias/mensais por plano, rate-limiting por minuto/segundo e bloqueio automático ao atingir o limite do Trial/Plano).
- **Motor de Criação e Disparo de Webhooks (`Webhooks Engine`)**:
  - Permitir que as corporações/aplicações cadastrem **Webhooks** (URLs de destino + `Secret` de assinatura HMAC + seleção de eventos como `email.sent`, `email.bounced`, `document.processed`, `subscription.trial_ended`, etc.), com fila de retentativas (Exponential Backoff) e log de entregas (`WebhookDeliveries`).
- **Roteamento Dinâmico & Domínios Customizados Cadastráveis no Caddy (`Caddy Admin API` + `On-Demand TLS`)**:
  - Como o Caddy é 100% controlado por API JSON em tempo real (`http://localhost:2019/config/...`) sem precisar reiniciar o servidor e possui **On-Demand TLS** (com endpoint `ask` batendo na API C# do Morphus para validar se o domínio/subdomínio está cadastrado e ativo no PostgreSQL), os próprios clientes/corporações poderão **cadastrar seus domínios/subdomínios e rotas no painel do Morphus** e o back-end C# injeta/atualiza as rotas e certificados SSL (Let's Encrypt) no Caddy automaticamente em tempo real!




