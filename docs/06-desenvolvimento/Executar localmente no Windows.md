# Executar localmente no Windows

Base: scripts, configuração e código da branch `feat/backend-guilherme`, até `0deda39`. Revisão documental: 06/11/2026. Este procedimento foi conferido por inspeção; não representa uma instalação homologada em Windows limpo.

## 1. Preparar o PowerShell e as ferramentas

O projeto é um monorepo: `apps/api` contém NestJS + Prisma, `apps/web` contém Next.js e `packages/core` contém as regras compartilhadas. Não é necessário instalar Nest CLI, Next CLI ou PostgreSQL globalmente: o caminho local implementado usa dependências do repositório e PostgreSQL embutido.

O projeto usa pnpm `11.17.0` e adota Node 24 em `.nvmrc`. O Expo SDK 58 exige Node 22 a partir de 22.13, Node 24 a partir de 24.3 ou Node 26 ou superior. Use uma versão compatível no terminal que executa o app.

Se Node/npm ainda não estiverem disponíveis, instale-os pelo procedimento Windows aprovado pela equipe. O repositório não fornece instalador de Node nem uma matriz de versões homologadas. Depois, abra um novo PowerShell. Para instalar a versão de pnpm declarada pelo projeto, use:

```powershell
# Qualquer pasta; instala uma ferramenta global na máquina.
npm.cmd install --global pnpm@11.17.0
node --version
pnpm.cmd --version
git --version
```

O comando de instalação acima é uma instrução operacional, não um script do projeto nem uma instalação executada nesta revisão. Nos exemplos, `.cmd` seleciona o executável Windows e evita depender da execução de wrappers `.ps1`.

Com o repositório já clonado, substitua o caminho abaixo pela sua pasta. Repita `Set-Location` em cada terminal novo:

```powershell
Set-Location 'C:\CAMINHO\Modolume'
git branch --show-current
git status --short
pnpm.cmd install --frozen-lockfile
```

Resultado esperado: branch `feat/backend-guilherme` e instalação concluída sem atualizar o lockfile. Não altere automaticamente a branch se houver trabalho local. Preserve `pnpm-workspace.yaml`: ele configura `nodeLinker: hoisted`, arquiteturas da máquina e autorização de builds de Prisma, esbuild e PostgreSQL embutido Windows x64.

## 2. Preparar os arquivos de ambiente

Antes de iniciar os processos, configure manualmente `apps/api/.env` e `apps/web/.env.local`, conforme [Configuração de ambiente](Configura%C3%A7%C3%A3o%20de%20ambiente.md). Os exemplos desse documento são modelos com placeholders, não valores para copiar sem substituição.

Para este guia, ambas as conexões de banco devem apontar ao banco local `modolume` em `localhost:5433`. O script de banco define usuário e senha locais no próprio código; consulte esses parâmetros em `apps/api/scripts/banco-local.ts` e configure-os privadamente, sem publicar a URL. Ele não lê usuário/senha de `.env` nem cria o papel restrito `modolume_api`.

Para o banco embutido isolado, as duas URLs podem usar a conta local provisionada pelo script. Isso não reproduz os privilégios mínimos de produção. O SQL `apps/api/prisma/sql/papel-da-api.sql` provisiona o papel restrito no banco da conexão atual.

## 3. Iniciar PostgreSQL — terminal A

Na raiz do repositório:

```powershell
pnpm.cmd --filter @modolume/api banco:local
```

Deixe este terminal aberto. O script usa `embedded-postgres` (`18.6.0-beta.19` no manifesto), inicializa o diretório quando ausente, inicia um PostgreSQL real e tenta criar o banco `modolume`. Os dados persistem em `apps/api/.banco-local`; a inicialização usa UTF-8 e locale `C`. A porta padrão é **5433**, não 5432.

O script imprime uma mensagem de conexão que contém credenciais locais: não copie essa saída para tickets ou documentação. A tentativa de criação do banco tem um `catch` genérico; a mensagem de inicialização, isoladamente, não comprova que todas as etapas tiveram sucesso.

Não há procedimento versionado de instalação como serviço Windows, Docker ou instalação manual do PostgreSQL. Este guia segue a alternativa embutida implementada no repositório.

## 4. Preparar Prisma e as tabelas — terminal B

Na raiz, com PostgreSQL iniciado e URLs locais configuradas:

```powershell
pnpm.cmd --filter @modolume/api db:generate
pnpm.cmd --filter @modolume/api exec prisma migrate status
```

O primeiro comando gera o cliente Prisma. O segundo consulta o estado das migrações usando a configuração Prisma; não aplica migrações. Em banco novo, pode indicar migrações pendentes e retornar código diferente de zero.

Somente depois de confirmar privadamente que `DIRECT_URL` aponta ao banco local correto, aplique as migrações versionadas:

```powershell
# Escreve no PostgreSQL local: cria/atualiza o esquema.
pnpm.cmd --filter @modolume/api db:migrar
pnpm.cmd --filter @modolume/api exec prisma migrate status
```

Resultado esperado: aplicação das migrações pendentes e estado atualizado. A lista vigente está em [`apps/api/prisma/migrations`](../../apps/api/prisma/migrations), incluindo a proteção de `registro`, a recuperação de senha e a renomeação para `ponto_mapa`.

### Dados e conta inicial

Migrações criam a estrutura, mas não substituem o carregamento de catálogos e contas. O projeto não oferece cadastro público para criar a primeira conta de administrador. Para homologação com login, é necessário um banco local já preparado ou o carregamento de demonstração previsto no script abaixo:

```powershell
# Opcional, somente em banco local de desenvolvimento, após configurar SENHA_DEMO.
# Escreve dados e contas; não foi executado nesta revisão documental.
pnpm.cmd --filter @modolume/api db:seed
```

O seed atualiza catálogos por `upsert`. Quando já existem pessoas na tabela da equipe, cria apenas as contas de coordenação/administração ausentes e não recria toda a escola. Em banco vazio, cria os dados de demonstração. Obtenha o e-mail da conta preparada com a equipe; a senha deve ser configurada privadamente. Não use a opção de reinicialização do seed: ela apaga dados. Nenhum reset faz parte deste guia.

## 5. Iniciar NestJS — terminal B

Na raiz, depois da preparação:

```powershell
pnpm.cmd --filter @modolume/api dev
```

O script executa `tsx watch --env-file=.env src/main.ts` dentro de `apps/api`. Não há etapa de compilação Nest CLI para desenvolvimento. A API conecta o Prisma na inicialização e escuta em `0.0.0.0`, porta padrão **3333**. Resultado esperado: mensagem `API do Modolume em http://localhost:3333`.

Em outro PowerShell, em qualquer pasta:

```powershell
Test-NetConnection -ComputerName localhost -Port 5433
Test-NetConnection -ComputerName localhost -Port 3333
Invoke-RestMethod -Uri 'http://localhost:3333/saude' -Method Get
```

Espera-se `TcpTestSucceeded: True` e resposta com `ok = True`, `servico = modolume-api`. `/saude` retorna um objeto fixo; não executa consulta de banco a cada chamada.

## 6. Iniciar Next.js — terminal C

Na raiz, com `API_URL` configurada para a API local:

```powershell
pnpm.cmd web
```

O script executa `next dev --port 3000` em `apps/web`. Aguarde a indicação de servidor pronto. Abra no navegador `http://localhost:3000/entrar`. A página inicial `/` é o site, e não comprova integração.

Use uma conta existente no PostgreSQL local. Professor acessa `/professor`, coordenação `/coordenacao` e administrador `/admin`; senha provisória leva a `/conta/senha`. Sem conta preparada, a validação deve parar antes do login: não considere o painel demonstrativo como substituto.

Para executar uma build web, em vez do servidor de desenvolvimento, pare o terminal C com `Ctrl+C` e, na raiz, use:

```powershell
pnpm.cmd --filter @modolume/web build
pnpm.cmd --filter @modolume/web start
```

O segundo comando depende do sucesso do primeiro. Configure `SESSAO_SEGREDO` para produção. Essa sequência não foi executada nesta revisão e não configura a API nem o banco por conta própria.

## 7. Confirmar integração real

1. Confirme privadamente que `DATABASE_URL` e `DIRECT_URL` são locais. `migrate status` valida a conexão de migração; o acesso autenticado exercita a conexão da API. Não imprima as URLs.
2. Configure `API_URL=http://localhost:3333` no ambiente web, reinicie Next.js e saia de sessões de demonstração anteriores.
3. Faça login em `/entrar` com uma conta do banco local. Abra turmas/alunos associados à conta e confira com os registros conhecidos desse banco. O login real consulta e atualiza a equipe e tenta registrar auditoria; ele não é uma operação somente de leitura.
4. Com a web ainda aberta, pare apenas a API no terminal B com `Ctrl+C`. Tente um novo login ou uma consulta que dependa da API. O esperado é falha de comunicação, não uma entrada automática em demonstração. Reinicie a API e repita. O teste de novo login evita confundir uma tela já renderizada com nova consulta.
5. Para homologação de persistência, em uma base local destinada a testes, altere pelo painel um dado de teste permitido ao papel, recarregue a página e reinicie API/web. O dado deve continuar disponível. Registre a alteração e a verificação; este passo escreve no banco e não foi executado nesta revisão.

`apps/web/lib/painel/api.ts` decide pelo uso de API apenas quando `API_URL` não está vazia. `dados.ts` usa `MockDataProvider` no modo demonstrativo; falha de rede com API configurada não é o mecanismo de seleção de demonstração. As chamadas são feitas pelo servidor Next.js: não espere necessariamente requisições diretas do navegador à porta 3333. O cookie de sessão é httpOnly e não deve ser copiado.

## 8. Erros comuns

### EADDRINUSE em 3333 ou outra porta ocupada

Em qualquer pasta do PowerShell, consulte processos, sem encerrá-los automaticamente:

```powershell
Get-NetTCPConnection -LocalPort 3333 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
Get-NetTCPConnection -LocalPort 5433 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
# Substitua pelo identificador obtido acima.
Get-Process -Id <PID_DO_PROCESSO>
```

Se for um servidor deste projeto, pare-o com `Ctrl+C` no terminal correspondente. Não inicie duas APIs na mesma porta nem encerre processos desconhecidos. Para mudar a API, configure `PORTA` em `apps/api/.env`, ajuste `API_URL` na web e reinicie ambos. `PORTA` prevalece sobre `PORT`.

Para mudar a porta do banco, no terminal A, na raiz, antes de iniciá-lo:

```powershell
# Exemplo de porta alternativa; confirme antes que está livre.
$env:BANCO_LOCAL_PORTA = '5434'
pnpm.cmd --filter @modolume/api banco:local
```

Atualize privadamente ambas as URLs para essa porta e reinicie a API. O script não carrega `.env` explicitamente. Não inicie duas instâncias sobre o mesmo diretório de dados. A web fixa 3000 no script `dev`; a solução padrão deste guia é liberar essa porta. Não presuma que mudar apenas uma variável `PORT` altere esse script.

### Falha de conexão, autenticação ou tabelas ausentes

Verifique, nesta ordem: PostgreSQL iniciado; porta acessível; host/porta/banco nas duas URLs; credenciais locais; permissões; estado das migrações; geração do cliente Prisma. Porta acessível só comprova transporte TCP. Banco local não utiliza hostname interno do Railway. Não execute reset nem exclua `.banco-local` para resolver uma conexão.

Se a API não iniciar, leia o erro no terminal B. Se a web informar que não consegue falar com o servidor, confira `/saude`, `API_URL` e a porta efetiva da API. Mudanças de ambiente devem ser seguidas de reinício do processo correspondente. Em erro de autorização, diferencie conta/senha, papel, conta inativa e senha provisória de falha de conexão.

### pnpm não encontrado, wrapper bloqueado ou instalação interrompida

Reabra PowerShell após instalar as ferramentas e execute `pnpm.cmd --version`. Use `.cmd` sem alterar globalmente a política de execução. Se `--frozen-lockfile` falhar, confira a versão de pnpm e a consistência do checkout; não regenere o lockfile como parte deste guia. Falha ao obter binários/dependências exige verificar acesso à rede e as permissões da máquina; não remova as autorizações de builds do workspace.

## 9. Parar os processos

Use `Ctrl+C` primeiro na web, depois na API e por último no banco. O script de PostgreSQL trata `SIGINT`/`SIGTERM` chamando `pg.stop()`. Não apague o diretório persistente.

## Fontes e próximos passos

Fontes: `package.json`, `pnpm-workspace.yaml`, `apps/api/package.json`, `apps/api/scripts/banco-local.ts`, `apps/api/src/main.ts`, `apps/api/src/infra.ts`, `apps/api/src/acesso.ts`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts`, `apps/web/package.json` e `apps/web/lib/painel/{api,dados,sessao}.ts`.

Consulte [Testes e verificações](Testes%20e%20verifica%C3%A7%C3%B5es.md) e [Correções de backend](../07-historico/Corre%C3%A7%C3%B5es%20de%20backend.md). Não há evidência nesta revisão de instalação limpa, build web ou homologação completa do ambiente.
