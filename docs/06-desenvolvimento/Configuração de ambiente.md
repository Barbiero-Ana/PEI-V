# Configuração de ambiente

Revisão: 11/11/2026, conforme o código e os scripts atuais. Os exemplos não contêm credenciais reais.
Valores entre `<...>` são placeholders e devem ser substituídos privadamente. Cada aplicação tem um
`.env.example` versionado. Arquivos locais preenchidos ficam fora do Git.

## API e Prisma

Arquivo de desenvolvimento: `apps/api/.env`. Execute comandos a partir da raiz com `--filter @modolume/api`.

| Variável       | Uso confirmado                                                       | Padrão e observações                                                                                                    |
| -------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Conexão PostgreSQL do cliente Prisma usado pela API e pelo seed      | Sem padrão no schema. Usuário precisa das permissões das operações executadas.                                          |
| `DIRECT_URL`   | Conexão direta configurada no datasource Prisma, usada nas migrações | Sem padrão no schema. Deve apontar ao mesmo banco, com permissão para alterar o esquema.                                |
| `JWT_SEGREDO`  | Assinatura/verificação de JWT                                        | Há fallback de desenvolvimento no código, omitido aqui. Ausente em produção interrompe a inicialização.                 |
| `PORTA`        | Porta da API                                                         | Prevalece sobre `PORT`; fallback final 3333.                                                                            |
| `PORT`         | Alternativa à `PORTA`                                                | Usada apenas se `PORTA` estiver ausente.                                                                                |
| `ORIGENS`      | Origens CORS, separadas por vírgula e com espaços aparados           | Fallback `http://localhost:3000`.                                                                                       |
| `SENHA_DEMO`   | Senha usada pelo seed para contas de demonstração                    | Há fallback no código, omitido aqui. Não é senha universal para contas existentes e não configura o login simulado web. |
| `NODE_ENV`     | Seleciona a exigência de segredo em produção                         | `production` ativa a exigência de `JWT_SEGREDO`.                                                                        |
| `RESEND_API_KEY` | Chave privada de envio | Somente na API. Sem ela, a recuperação fica indisponível. |
| `EMAIL_REMETENTE` | Remetente autorizado no Resend | Exemplo: `Modolume <acesso@envios.modolume.com.br>`. O domínio precisa estar verificado. |
| `WEB_URL` | Origem do painel nos links de definição e recuperação | Produção exige HTTPS. No ambiente publicado: `https://www.modolume.com.br`. |
| `REDEFINICAO_MINUTOS` | Prazo do link de uso único | Inteiro de 5 a 60. Padrão 30. |

Modelo de arquivo para o banco local embutido, sem credenciais reais:

```dotenv
DATABASE_URL="postgresql://<USUARIO_LOCAL>:<SENHA_LOCAL_CODIFICADA_PARA_URL>@localhost:5433/modolume?schema=public"
DIRECT_URL="postgresql://<USUARIO_LOCAL_MIGRACAO>:<SENHA_LOCAL_CODIFICADA_PARA_URL>@localhost:5433/modolume?schema=public"
JWT_SEGREDO="<SEGREDO_PRIVADO_DA_API>"
PORTA=3333
ORIGENS="http://localhost:3000"
SENHA_DEMO="<SENHA_PRIVADA_PARA_CARGA_LOCAL>"
```

Não execute com placeholders literais. Caracteres especiais na senha precisam ser representados corretamente na URL. O banco embutido provisiona a conta definida em `scripts/banco-local.ts`; não cria automaticamente um usuário `modolume_api`. Para desenvolvimento isolado, ambas as conexões podem usar essa conta local. Isso não homologa privilégios mínimos.

O SQL `prisma/sql/papel-da-api.sql` usa o banco da conexão atual e mantém `registro` restrito a leitura e acréscimo. Migrações e seed escrevem no banco indicado pelas respectivas conexões. Confira o destino antes de executar. Veja a [arquitetura atual](../08-engenharia/arquitetura.md) para configurar o Resend e a recuperação de acesso.

### Carregamento

- `dev`: `tsx watch --env-file=.env src/main.ts`, com carregamento explícito do arquivo na pasta da API.
- `db:seed`: também contém `--env-file=.env`.
- `start`: `tsx src/main.ts`, sem carregamento explícito de `.env` no script; forneça ambiente ao processo quando utilizar esse modo.
- Comandos Prisma usam o schema em `prisma/schema.prisma` e a resolução de ambiente do CLI Prisma; não há `--env-file` nesses scripts.
- O script `banco:local` não carrega `.env` explicitamente. `BANCO_LOCAL_PORTA` deve estar no ambiente do processo, por exemplo `$env:BANCO_LOCAL_PORTA = '5434'` no PowerShell que inicia o banco. O padrão é 5433. Usuário/senha e banco não são configuráveis por essa variável.

Uma variável já exportada no terminal pode interferir no ambiente efetivo. Confira os nomes configurados privadamente; não use comandos que despejem valores ou todo o ambiente em logs compartilhados.

## Next.js

Arquivo local: `apps/web/.env.local`. O script `pnpm.cmd web`, executado na raiz, inicia Next.js em `apps/web`.

| Variável            | Uso confirmado                                    | Padrão e observações                                                                                      |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `API_URL`           | URL usada pelo servidor Next.js para chamar a API | Obrigatória em produção. Ausente/vazia seleciona demonstração apenas em desenvolvimento. Barra final é removida. Local: `http://localhost:3333`. |
| `SESSAO_SEGREDO`    | Assinatura HMAC do cookie de sessão               | Fallback de desenvolvimento omitido aqui; obrigatório em produção. Não substitui `JWT_SEGREDO`.           |
| `PAINEL_SENHA_DEMO` | Login simulado sem API                            | Fallback omitido. Não altera a senha persistida no PostgreSQL.                                            |
| `NEXT_DIST_DIR`     | Diretório de build em `next.config.ts`            | Padrão `.next`; pode separar uma segunda build.                                                           |
| `NODE_ENV`          | Exigência de segredo e cookie seguro              | Cookie recebe `secure` quando `production`.                                                               |

Modelo para o modo integrado:

```dotenv
API_URL="http://localhost:3333"
SESSAO_SEGREDO="<SEGREDO_PRIVADO_DA_SESSAO_WEB>"
```

Não é necessário configurar `PAINEL_SENHA_DEMO` para autenticação pela API. O token fica na sessão httpOnly e as chamadas são feitas pelo servidor Next.js; `API_URL` não usa prefixo `NEXT_PUBLIC_` no código. Reinicie Next.js após alterar o ambiente e faça novo login se havia sessão demonstrativa.

## Identificar o modo efetivo

`apps/web/lib/painel/api.ts` usa API quando `API_URL` não está vazia e rejeita demonstração em produção.
`apps/web/lib/painel/dados.ts` fornece dados de `ProvedorDadosDemonstracao` no modo local sem API;
`app/professor/acoes.ts` também separa os dois caminhos de login. Configurar uma URL inválida gera erro
de comunicação, não troca para dados simulados.

## App nativo e EAS

O app é exclusivo de Android e iOS. Copie `apps/mobile/.env.example` para `.env.local` no desenvolvimento.
`EXPO_PUBLIC_API_URL` define a API e é incluída no bundle. Não coloque segredos em variáveis `EXPO_PUBLIC_`.
Sem endereço, a conta escolar fica indisponível e a demonstração permanece local.

`auto` procura a API na porta 3333 do computador que serve o Metro. Isso requer conectividade com esse
computador; um túnel do Expo não publica a API. Em APK distribuído, use uma API HTTPS acessível.
O ambiente EAS `preview` atende os perfis `preview` e `play-internal`; o ambiente `production` atende
o perfil `production`. Configure `EXPO_PUBLIC_API_URL` em cada ambiente usado e gere outro build
ao mudar o endereço. Os perfis de loja rejeitam endereço ausente, `auto`, HTTP ou domínio local.
O [roteiro Android](../08-engenharia/publicacao-android.md) contém o comando e os aceites.

A receita de confirmação está em [Executar localmente no Windows](Executar%20localmente%20no%20Windows.md). Não publique `.env`, URLs com credenciais, cookies, JWT ou capturas de respostas de login.

## Fontes

`apps/api/{package.json,scripts/banco-local.ts,src/main.ts,src/credencial.ts,prisma/schema.prisma,prisma/seed.ts}`,
`apps/web/next.config.ts`, `apps/web/lib/painel/{api,sessao,cookie-sessao}.ts`, `apps/web/app/professor/acoes.ts`,
`apps/mobile/src/lib/api.ts`, `apps/mobile/eas.json` e `apps/mobile/scripts/verificar-api-loja.mjs`.
