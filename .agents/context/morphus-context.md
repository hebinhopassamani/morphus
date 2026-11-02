# Contexto Morphus - Para desenvolvedores e IAs

## Projeto Morphus

O projeto Morphus é dividido em dois aplicativos uma para o front end e outro para o back end, Morphus possui um banco de dados postgtres e esta programado para subir e rodar em containersr docker. os dois aplicativos são:

- mpx-frontend e mpx-backend =&gt; As duas aplicações fazem parte de um único repositório no github (Monorepositorio) e
- Hoje nos temos uma VPS rodando ubtu linux e docker, porém apenas a aplicação frontend e um banco de dados postgres foram publicado lá.
- Temos também um domínio registrado e apontando para o frontend https://www.morphus.me
- Também thems uma conta no https://www.auth0.com ele faz hoje tofda nossa parte de autenticação ee validação de usuários, ao chegar no frontend por exemplo, o usuário e redirecionado para a pagina de login deles, mas esta pagina esta toda customizada para o morphus
- Também já está configurado fazer login com o google. existe no google cloud uma aplicação chamada morphus configurada.

- Morphus frontend (mpx-frontend)
- É um aplicativo Anguluar rodando hoje na versão 22.2.2 com node na versão 24.22.0 versão.
- Não possui suporte para SSR (Server Side Render), roda somente no browser
- Utiliza uma biblioteca chamada BuilderKit clicando aqui você pode ver a documentação oficial

BuilderKit é uma biblioteca com vários componentes simples, componentes avancados, 4 templates prontos e 27 blocos de construção prontos para serem adaptados e utilizados

- A diferença entre blocos de construção e componentes é complexidade e as funcionalidades de cada um, blocos de construção às vezes controam páginas inteiras sozinhos, e componentes são alsudos em partes da página ou de outros componentes ou blocos
- nNa raiz do projeto existe uma pasta chamada .builderkit dentro dela você verá a pasta templates com os 4 templates, a pasta blocks com todo os blocos de construção e uma outra pasta chamada builderkit que possui uma mini estrutura de pastas com componentes e funcionalidades que estão em praticamente em todos os projetos / templates
- Todos os templates são basicamente templates de administração, uma barra lateral responsável com menu, uma barra no topo com informações de usuário entre outras informações e bootees de ação e um content no centro aonde as páginas filhas são renderizadas.

- Estrutura do projeto

FOLDER_STRUCTURE.md 98 kB

No arquivo acima, que também está na raiz do projeto, está a estrutura completa da nossa aplicação hoje.

O que é importante neste momento?

Existem no projeto, 5 arquivos com instruções e habilidades para os agentes de IA

- O primeiro arquivo que esta na raiz e fala dos dois projetos é este que você está lendo agora MORPHUS_CONTEXT -&gt; este arquivo possui um breve detalhamento do contexto da aplicação MORPHUS

- O segundo arquivo está na raiz da aplicação angular mpx-frontend. Ele se chama AGENTS.md e ele diz basicamente que as UI (User Interfaces) do projeto frontend são construídas usando blocos de construção e indica como aonde estão as Skills para os agentes saberem configurar atualizar e montar os blocos.

- O terceiro arquivo está dentro da pasta ./builderkit/blocks/INDEX.md,

esse arquivo tem descrições sobre cada bloco e como chegar até ele e como utilizá-lo

O quarto e o quinto arquivo está dentro da pasta ./agents/skills/builderkit/ na raiz da aplicação frontend e possuem habilidades para os agentes

- guideline.md =&gt; baseicamente descrive as diretrizes a serem seguidas para a construção do design da aplicação frontend, fala sobre estilização, themas, componentes, blocos páginas e como isso tudo deve se encaixar.
- SKILLS.md =&gt; Este arquivo detalha ainda mais toda a biblioteca builderkit

- Sobre o resto da estrutura de mpx-frontend

Você pode ver na estrutura do projeto mpx-fronend, que na raiz, tempos além dos arquivos padrões,

- Um Dockerfile =&gt; Esse arquivo está deprecado. quando este projeto foi criado pela primeira vez, ele usava SSR para rendenizar os htmls em um server onde js e era esse arquivo que montava a imagem desse server rodando onde em um container docker, porém desconitua, os a parte do SSR, estava apresentando muita instabilidade na autenticação
- docker-compose.yml =&gt; Este arquivo builda e instala a aplicao frontend e o banco de dados postgres
- CaddyFile =&gt; o CaddyFile cria a imagem para um outr container com a funcionalidade de gerar um certificado https para o dominio

# Drnyto da pasta sorce temos

- index.html =&gt; aonde tudo é reindenciado
- Styles =&gt; dentro da pasta styles, temos os arquivos .css do projeto
- base =&gt; na pasta base estão os arquivos que estilizam a base do aplicativo, body, htm, h1, h2 tipografias etc...
- components =&gt; aqui os components por exemplo compojments do angular material, tailwindcss são sobrescritos reestilizados ou atravez de aplicação de novos estilos ou definindo valores de variaveis css. somente alguns componentes são modificados aqui
- material =&gt; ja na psta material, praticamente todos os componentes do angular material são modificados para o builderkit

- tailwindcss =&gt; aqui temos funcionalidades de thema do tailwindcss
- thirt-part =&gt; aqui só existe uma classe css e ela se referencia aos icones Lucidde Icons
- styles.css =&gt; se você reparou tudo esta em subpastas, menos este arquivo que edta sozinho na razi da pasta styles, é ele quem está registrao no angular.json como sendo nosso css global e ele esta aqui nesta pasta recebendo as importacoes de todos arquivos dentro das subpastas, se criarmos uma pasta para morphus por exemplo e criarmos dentro dela um morphus.css para que ele seja jogado para dentro da pagina da aplicacao basta fazer uma referencia dele dentro de styles.css (@import './morphus/morphus.css' por exemplo.
- enviroument =&gt; nesta pasta estão as variaveis do sistema, por exemplo, aqui estão definidas as variaveis que são utilizadas para chamada da bibiliotec de auth0
- components =&gt; aqui nesta pasta devem ficar os componentes globais, hoje dentro de componentes temos apenas a pasta builderkit com alguns components quando criarmos nosso primeiro complente global será criada a pasta morphus e dentro dela nodos componentes

- A pasta apps essa pasta explica bem como o ecossistema morphus vai funcionar, além da pasta core que é utilizada para armazenar funcionalidades, utensils, tipos tanto para o builderkit como para morphus teemos 3 outras pastas. Essas 3 pastas são o coração do Morphus e ela subdivide o morphus em 3 sub aplicações

- A aplicação morphus =&gt; Essa aplicação é o carro chefe do negócio, ela é um painel administrativo, que vão regir as outras duas apps,

- A aplicação security =&gt; Essa aplicação cuida da segurança do sistema, telas de login, cadastro recuperação de senha chamadas a auth0 etr e outras coisas são responsabilidade de security

- A aplicação website =&gt; é aqui que o usuário vai ver, vai navegar, somente aqui, ele não vai conhecer uma app chamada security, e só vai cair dentro de home em website e navegar pelas funcionalidades do morphus por ali, obedecendo, sem ele saber o que security e morphus criaram como regras.

FOLDER_STRUCTURE.md 98 kB

- Morphus backend (mpx-backend)

Morphus backend roda em .Net Core verrsão 11.0.100-rc.2.26504.105 e segue o mais alto padrão de design partner a Clean Achetecture.

Ele é separado em 5 camadas e de forma muito clara e coerente cada uma sabe exatamente exerce o seu papel. As camadas são:

- Web Api -
- Responsável por receber as requisições HTTP, Verificar a permissão desta requisição seguir com a requisição adiante, para a camada Application), receber e retornar o conjunto de dados solicitado.
- É principal defesa de segurança do sistema morphus backend e para isso utiliza
- Microsoft.AspNetCoreAuthentication.JwtBearer versão (11.0.0-rc.1.26425.128), integrada com o site www.auth0.com e utilizando a biblioteca oficial ela representa uma fortaleza.
- a quem ela faz referência: Em teoria a clean architecture permite que uma camada como a wenapi so referencie a camada Application, pois ela deve ser 100% desacoplada do banco de dados e das regras de negócio, porém é necessário que ela referencie todas as outras camadas, mas com um objetivo simples e sussinto, por exemplo: como injetamos a dependência e inicializamos o contexto do banco de dados sem que a webapi saiba quem é o contexto? então ele precisa conhecer os objetos da camada de infrastructure. porém esta é a única função que ela pode fazer com as 3 camadas as quais ela não tem permissão de conhecer, somente registro de dependências, qualquer outro acesso é extritamente proibido, a não ser para a camada Application que é o fluxo normal da web api, ela somente tem direito de acessar a camada Applicationj e chamar seus métodos

- Application

- A camada Appliocarion é responsável pelos nossos hanflresr servicos, casos de uso...
- O que é um handler / Servico: São métodos que como o nome ja diz, tratam as requisições da Api realizando alguma operação sobre elas, encaminhand-as para proxima camada e esperando o resultado e é ela quem efetua boa parte da logivca envolvida nessas requisições, a camada Application pode fazer muitas coisas antes de devolver o resultado da requisição para a api
- A quem ela faz referência: A camada Application apenas faz referência à Camada de Domain.

- Domain

- Domains contem as entidades do projeto, os enumns, as interfaces do sistema, interface por exemplo como a do do repositório genérico e da interface de transação de banco de dados as interfaces de cada entidade
- A quem ela faz referência: A NINGUEM, Domain é sozinha, c# puro, e não depende de ninguém, é dessa forma que ela executa as regras de nência do sistema, sem precisar de ninguém para isso

- InfraStructure

- A camada de Infrastructure, é a responsável pelo banco de dados, consulta, inserção, atualização entre outras, no nosso caso ela utiliza EntityFramework core para isso.

- Alem disso ela implementa muitas interfaces da camada de Domain, por exemplo os repositórios de acesso a dados de cada entidad. Esses repositórios são classes que implementam os métodos das interfaces do domínio e esses métodos vão ao banco de dados

- É ela que contém o dbContext (MorphusDbContext), as Migrations entre outras.

- A quem ela faz referência, A camada Infrastructure, depende apenas da camada de Application, Mas como a camada Application faz referência a camada de Domains, os dados de Domains acabam chegando até a camada de Infrastructure, e isso não é nada proibido pela clean architecture, pelo contrário, Infrastructure, precisa conhecer as entidades por exemplo, para registralas no contexto do banco de dados, essa referência cruzada se chama (transitively gets Domain),

- CrossCutting

- A camada CrossCuttin é responsável por unicamente, registrar todas, sem excessão todas as injeções de dependência do sistema, no final das contas ela é referenciada no arquivo programs.cs da wenapi e lá ela chama uma única método que recebe o Web Builder como parâmetro e dentro deste método ela utiliza esse builder de referência para registrar as injeções de dependência

- Porque isso é muito legal? Tudo fuica centralizado apenas em um único arquivo, seu program.cs, que iria ter umas 200 linhas vai ter epans 1 referente à injeção de defenência, fácil de dar manutenção, achar aonde estão os registros.

- A quem ela referencia, a todas as outras camadas menus a webapi, pois é a wenapi que faz referencia a ela, para que ela chegue até programs.cs

Essas duas apps, front end e back end irão se comunicar o tempo todo, font end, fazendo solicitacoes ao back end.

E o controle de usuários e aceso, este controle 90% nas mãos da instituição auth0.com

Lá serão castrados organizações e dentro de cada uma delas são cadastrados usuários, roled, prtmissões, e tudo isso vai imbutido dentro do JWT Token que eles enviam para nós quando um usuário é autenticado, só precisamos restringir os métodos da webapi com authorize e políticas de segurança baseados daqueles valios castrados no auth0 e atribuídos ao usuário.

Mas não se engane, teremos um trabalho sim e bem grande pois no morphus um usuário pode pertencer a mais de uma organização ao logar no nosso sistema o usuário poderá ter que escolher em qual organização ele vai logar, além isso teremos que implementar MultiTenant para termos um responsável por todos o HTenant

O que é o Morphus

Morphus é um gestor de corporações e suas filiais, é um gestor de acessos e permissões, no morphus uma corporação possui um autorelacionamentom pois ela pode ter n filiais abaixo delas, entao o mesmo usuário pode ter aceso a 4 filiais diferente por exemplo entao teremos que tratar essas funcionalidades que o auth0 nao trata, no nosso banco de dados.

O morphus é um sistema de entrada de nota fiscal, cadastro de produtos, casfastros em geral como naturaze de operação, tributação, contas a pagar, contaas a receber, importacao automatica de notas fiscais, conciliacao bancaria, Api de envio de emails atravez de templates html castrados no banco de dados, e outras funcionalidades que estao sendo pensadass ainda.

## Algumas regras de padrão de desenvolvimento muito importantes

1. Repare que todos os componentes angular criados, tem no mínimo um .ts e um .html e possi a seguinte nomenclatura, app.component.tsapp.component.html e esse html é reeferenciado dentro do .ts

i. sempre faca assim,
ii. <nom-do-componente>.component.ts
iii. <nom-do-componente>.component.htmls
iv. Jamais coloque o html debtro do .ts na tag template, isso dificulta imensamente a leiura visualizacao, e manutencao

2. Dentro de uma pasta voê irá encontra varias subpastas, ou varios arquivos, jamais misture subpasta e arquivos dentro de uma pasta, mesmo que seja um unico arquivo crie uma subpasta para ele. Isso porque futuramente podem aparecer novos arquivos irãos daquele que ficaria sozinha ai vc teria que criar a sub pasta para colocar os dois irmão juntos e quebraria o codigo todo.

3. **Tom de Voz Amigável e Descontraído (UX Writing)**: A parte mais importante de um sistema é saber conversar com o seu usuário. Todos os textos das telas do Morphus (títulos, descrições, instruções, mensagens de espera e feedbacks) devem ser muito amigáveis, leves, acolhedores e descontraídos.

As regras acima são para aplicação no frontend. Isso porque no backend a cleanarchitecture resolve muito a respeito de pasroes de desenvolvimento.