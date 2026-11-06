# Configuração de ambiente

Base: branch `feat/backend-guilherme`, até `0deda39`. Revisão: 06/11/2026. Informações extraídas do código e scripts; nenhum conteúdo de arquivo `.env` foi consultado. Valores entre `<...>` são placeholders e devem ser substituídos privadamente.

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

O SQL `prisma/sql/papel-da-api.sql` visa produção e fixa `railway` como banco. Não aplique diretamente ao banco `modolume`. Migrações e seed escrevem no banco indicado pelas respectivas conexões; confirme o destino antes de qualquer execução.

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
| `API_URL`           | URL usada pelo servidor Next.js para chamar a API | Ausente/vazia seleciona demonstração. Barra final é removida. Para o guia local: `http://localhost:3333`. |
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

`apps/web/lib/painel/api.ts` usa API quando `API_URL` não está vazia. `apps/web/lib/painel/dados.ts` fornece dados de `MockDataProvider` no modo sem API; `app/professor/acoes.ts` também separa os dois caminhos de login. Configurar uma URL inválida gera erro de comunicação, não prova de conexão nem troca intencional para dados simulados.

A receita de confirmação está em [Executar localmente no Windows](Executar%20localmente%20no%20Windows.md). Não publique `.env`, URLs com credenciais, cookies, JWT ou capturas de respostas de login.

## Fontes

`apps/api/{package.json,scripts/banco-local.ts,src/main.ts,prisma/schema.prisma,prisma/seed.ts}`, `apps/web/next.config.ts`, `apps/web/lib/painel/{api,sessao,cookie-sessao}.ts` e `apps/web/app/professor/acoes.ts`.
