# Arquitetura do Modolume

O aplicativo Expo atende o aluno no Android e no iOS. O portal Next.js atende administrador, coordenação e professor. A API NestJS valida operações e aplica permissões. O PostgreSQL mantém o histórico institucional. O núcleo TypeScript reúne catálogo, cálculos e validações que podem ser compartilhados sem depender da interface ou do banco.

```mermaid
flowchart LR
  Aluno[Aluno no aplicativo] --> Estado[Estado por identidade e fila local]
  Estado --> API[API NestJS]
  Equipe[Equipe no navegador] --> Web[Servidor Next.js]
  Web --> API
  API --> Banco[(PostgreSQL via Prisma)]
  API --> Resend[Resend quando configurado]
  Aluno --> Nucleo[Núcleo TypeScript]
  Web --> Nucleo
  API --> Nucleo
```

| Área | Organização e responsabilidade |
| --- | --- |
| `apps/mobile/src` | Rotas Expo em `app`, apresentação em `componentes`, identidade, fila e progresso em `estado`. O servidor recebe jogadas com ID de origem local. |
| `apps/web` | Rotas e ações Next em `app`, interface em `components`, sessão e integração em `lib`. A API recebe o JWT por chamada do servidor Next. O navegador usa cookie assinado e `HttpOnly`. |
| `apps/api/src` | Controladores por perfil. `infra.ts` reúne autenticação, validação e auditoria. `credencial.ts` trata senha e entrega do link. `jogada.ts` valida o resultado e os vínculos. `conversao.ts` adapta o modelo persistido para os contratos. |
| `apps/api/prisma` | Modelo relacional, migrações versionadas e papel de execução. O cliente de execução tem privilégio menor que o usuário de migração. |
| `packages/core/src` | Catálogo e regras de jogo, análise, indicadores, esquemas compartilhados e dados de demonstração para desenvolvimento. |

O monorepo anterior já separava as aplicações, o núcleo e o banco. A mudança extraiu validações de jogadas e credenciais dos controladores, acrescentou validações compartilhadas de data, busca e paginação e moveu a gravação de auditoria para as transações das operações que a produzem. O núcleo passou a usar nomes como `ProvedorDados`, `ProvedorDadosDemonstracao`, `esquemaPlano`, `indicador.ts` e `formato.ts`.

## Convenções

- Nomes próprios da aplicação em português do Brasil, sem acentos em identificadores. Use `PascalCase` para tipos e componentes, `camelCase` para funções e propriedades, e `kebab-case` para arquivos de domínio.
- Modelos e tabelas no singular. O PostgreSQL usa `snake_case` e o Prisma mapeia nomes físicos com `@map` e `@@map`.
- Nomes de arquivos exigidos por Next e Expo seguem os frameworks. A versão atual preserva rotas já consumidas e chaves JSON existentes. Identificadores legados como `status` e diretórios `components` e `lib` ainda constam no inventário de padronização.
- Alteração de schema exige migração versionada, teste de atualização e revisão das referências. Os PRDs originais são a fonte dos critérios. Mudanças no código e evidências ficam na documentação de engenharia.

## Acesso e recuperação

A equipe entra com e-mail e senha. O banco guarda hash bcrypt. O JWT de equipe dura 8 horas e contém a versão da credencial. Troca, redefinição, revogação, mudança de papel ou desativação invalidam sessões anteriores. A migração exige um novo login de equipe porque o token anterior não tinha a versão. O aluno continua usando código pessoal e PIN.

Em `/redefinir-senha`, a pessoa solicita um link para o e-mail cadastrado. A API guarda o resumo SHA-256 de um valor aleatório de 256 bits e o prazo. A confirmação atualiza a senha, consome o resumo e registra o evento em uma transação. O novo token segue no fragmento da URL. O administrador pode revogar a credencial quando o canal de e-mail estiver configurado. Pode ajustar o e-mail durante o cadastro inicial. Depois de definida a senha, o e-mail é protegido contra alteração administrativa, inclusive após revogação.

No app, `estado/sessao.ts` controla a credencial e sua migração. `estado/identidade.tsx` conecta o
repositório ao SecureStore. O cache e a fila continuam em `estado/isolamento.ts` e são lidos por identidade.
O adaptador `estado/ambiente.ts` separa esses repositórios pelo endereço da API, inclusive no cofre;
a produção conserva suas chaves históricas. IDs iguais em servidores distintos não compartilham dados.
A autenticação e a persistência de progresso têm ciclos separados. [ADR 0023](../03-decisoes/0023-sessao-movel-no-cofre-nativo.md).

Configure na API `RESEND_API_KEY`, `EMAIL_REMETENTE` em domínio verificado e `WEB_URL` apontando para a origem confiável da web. `REDEFINICAO_MINUTOS` aceita inteiros de 5 a 60 e tem padrão 30. Em produção a origem exige HTTPS. O fluxo responde com indisponibilidade se faltarem variáveis. O [contrato de envio do Resend](https://resend.com/docs/api-reference/emails/send-email) foi exercitado com resposta simulada. A [orientação de recuperação da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) fundamenta o uso único, o prazo e a revogação.

## Envio de jogadas e atividades

O app separa fila e progresso por identidade. A conclusão local grava a recompensa e a jogada juntas.
`POST /aluno/sincronizar` confirma histórico, créditos e compras na mesma transação, serializada por aluno.
O servidor calcula recompensas e preços no núcleo, deduplica IDs e devolve a revisão confirmada. O app
reaplica as operações pendentes sobre essa revisão e ignora respostas antigas. A migração importa o retrato
legado uma vez por instalação como piso histórico. Veja o [ADR 0024](../03-decisoes/0024-progresso-por-operacoes-confirmadas.md).

Os controladores de sincronização, avaliações e avisos têm responsabilidades próprias. O primeiro início
é separado do resultado, o prazo é opcional e a avaliação publicada é uma versão imutável. O aluno recebe
somente devolutivas publicadas e seus avisos. A leitura do aluno fica no banco. O app funciona com cache e
fila local; os avisos novos chegam na atualização com conexão. As publicações agora preservam o conteúdo e os destinatários, com início e entrega por versão,
conforme [ADR 0026](../03-decisoes/0026-publicacoes-imutaveis-de-atividade.md).

App e painel usam o mesmo cálculo de aprendizagem. A adaptação web conserva medidas originais e o
agrupamento do pentagrama é feito sobre o domínio. Acerto médio nas tabelas continua sendo uma medida
distinta, identificada como acerto. Consulte a [consolidação funcional](consolidacao-funcional.md).

## Operação e verificação

Execute as suítes de cada pacote, `pnpm -r typecheck`, `pnpm -r lint` e a build web. `pnpm --filter @modolume/api test:banco` cria um PostgreSQL descartável em `tmp/auditoria-banco-*` e usa apenas dados sintéticos. A API usa `DATABASE_URL` com `modolume_api` e `DIRECT_URL` para migrações. Configure `API_URL` e os segredos do ambiente web antes de iniciar em produção. No app, a demonstração do visitante guarda o progresso no aparelho. A sessão escolar exige a API e tem dados separados por aluno.

Antes de aplicar uma migração a uma base institucional, valide o backup, o destino de `DIRECT_URL` e os privilégios efetivos do papel em homologação. O ambiente real precisa de teste de HTTPS, entrega de e-mail, fluxos móveis e carga, conforme a [matriz](matriz.md).

## Preparação do APK em 13/11/2026

A homologação tem ambiente e banco próprios. O pre-deploy idempotente recusa produção e bases preexistentes sem a marca. O APK `preview` exige API HTTPS. A integração de crashes é opcional, sem envio quando não há DSN; a filtragem e o diagnóstico HTTP estão cobertos por testes. Veja o [roteiro de homologação](homologacao-e-preparacao-apk.md) e o [ADR 0027](../03-decisoes/0027-homologacao-isolada-e-diagnostico.md).
