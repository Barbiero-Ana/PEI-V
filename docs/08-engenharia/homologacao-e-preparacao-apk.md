# Homologação e preparação do APK — 13/11/2026

Responsável: **Ana Barbiero — Líder de projeto**. As datas históricas de PRDs e ADRs permanecem preservadas.

## Etapas e evidências

| Etapa | Entrega | Validação |
| --- | --- | --- |
| Atividades | Publicações imutáveis, edição somente do prazo e referência da resposta à versão | `verificar-publicacoes.ts`: concorrência, conteúdo, destinatários, prazo, reenvio e arquivamento |
| Persistência | Migração `20261113130000_publicacao_atividade`, com observação do legado e preservação das jogadas | PostgreSQL descartável e ensaio sobre backup antes de alterar o banco principal |
| Build | URL HTTPS validada também no APK `preview`; ambiente EAS explícito | `build.test.ts` recusa ausência, HTTP, localhost, IP e credenciais na URL |
| Erros | Tela de recuperação; Sentry preparado, desativado sem DSN; logs seguros e prontidão na API | `diagnostico.test.ts` e `observabilidade.test.ts`; envio real ao Sentry pendente de conta/projeto |
| Homologação | Banco, API e credenciais próprios; carga fictícia idempotente | Pre-deploy ensaiado duas vezes; recusa ambiente principal e banco existente sem marca |
| Artefato | APK novo e manifesto conferido | Gerar após implantação de homologação e verificação integrada; não reutilizar os artefatos de código 2 |
| Aparelhos | Jornada e acessibilidade na versão instalada | Roteiro manual abaixo; testes de código não equivalem a aceite físico |

O [ADR 0026](../03-decisoes/0026-publicacoes-imutaveis-de-atividade.md) descreve o contrato de publicação.
O [ADR 0027](../03-decisoes/0027-homologacao-isolada-e-diagnostico.md) descreve ambientes e diagnóstico.

## Infraestrutura de homologação

- Projeto Railway existente, ambiente novo `homologacao` (`27ee0e2d-841b-4a66-8a49-474a5c0a3fc5`).
- Banco novo `Postgres-HWSl`; não é o banco `Postgres` de `production`.
- Serviço novo `modolume-api-homologacao`; a API original `PEI-V` continua em `production`.
- Pre-deploy exclusivo: `pnpm --filter @modolume/api homologacao:preparar`, timeout de 300 segundos.
- Healthcheck: `/prontidao`. Aguardar a CI antes de implantar.
- `NODE_ENV=production` também em homologação, para manter as proteções de execução. Somente o processo
  controlado de carga fictícia usa `NODE_ENV=development` e a conexão administrativa isolada.
- `DATABASE_URL` usa `modolume_api`; `DIRECT_URL` usa o administrador do banco novo, por referência Railway.
- Credenciais próprias em `API_BANCO_SENHA`, `JWT_SEGREDO`, `SENHA_DEMO` e `PIN_HOMOLOGACAO`.
  `AMBIENTE_DADOS_FICTICIOS=true` habilita a preparação exclusivamente no ambiente nomeado.
- Arquivo privado local: `apps/api/.env.homologacao.local`, ignorado pelo Git. Não anexar seu conteúdo a relatórios.

As URLs finais e a implantação são registradas depois da verificação; a criação de um ambiente vazio não
significa que a API já esteja funcionando. Não sincronizar segredos ou dados de produção para este ambiente.

## Backups e disponibilidade

A tela de Backups do PostgreSQL de produção, conferida em 13/11/2026, informa que novos backups,
agendamentos e recuperação por ponto no tempo exigem o plano Pro. Nenhum upgrade foi solicitado ou
efetuado. O backup manual local e seu ensaio de restauração continuam registrados na implantação anterior.
A equipe deve escolher o plano ou outra solução de cópia recorrente antes do piloto com dados reais.

O workflow `disponibilidade.yml` verifica a API com acesso ao banco e o painel a cada hora, sem credenciais
ou dados de alunos. Falhas ficam visíveis no GitHub Actions; notificações dependem das preferências da conta.
O agendamento só é ativado ao chegar à branch padrão, e é de melhor esforço, sem garantia de horário ou SLA.
O healthcheck `/prontidao` no Railway também impede concluir uma implantação cuja base esteja inacessível.

Para conferir o percurso integrado, configure `API_URL_HOMOLOGACAO` no arquivo privado e execute
`node --env-file=apps/api/.env.homologacao.local scripts/verificar-homologacao.mjs`. O script recusa
produção, confirma o ambiente, usa a professora fictícia e registra uma atividade de teste, uma entrega
deduplicada, uma devolutiva e seu aviso. Os registros de teste ficam identificados na base de homologação.

## Configurar o projeto Sentry

1. A equipe cria sua conta e um projeto React Native no Sentry.
2. Configura `EXPO_PUBLIC_SENTRY_DSN` no ambiente EAS correspondente. O DSN é público.
3. Configura `SENTRY_ORG`, `SENTRY_PROJECT` e `SENTRY_AUTH_TOKEN` no build; o token nunca usa `EXPO_PUBLIC_`.
4. Gera outro build e confirma o upload dos mapas de código. Envia um erro controlado de homologação,
   confere a versão e a pilha e inspeciona o evento para dados pessoais. Confere também as opções de
   privacidade e descarte de IP no projeto Sentry.
5. Acrescenta o serviço ao inventário de dados e homologa a configuração antes do piloto.

Sem o projeto/DSN, não há envio de crashes. Falhas nativas e sua sanitização devem ser verificadas no
artefato instalado, além do teste unitário do evento JavaScript.

Referências: [Expo/Sentry](https://docs.expo.dev/guides/using-sentry/),
[filtragem no SDK](https://docs.sentry.io/platforms/react-native/data-management/sensitive-data/).

## Aceite com o APK

Usar apenas a escola fictícia de homologação. Registrar versão do APK, commit, aparelho, Android,
data, responsável, esperado e observado. Manter credenciais e códigos em material privado.

1. Instalar e atualizar uma instalação anterior sem desinstalar; conferir sessão e progresso.
2. Entrar por código/PIN, sair uma vez, trocar de aluno e confirmar isolamento do histórico e avatar.
3. Concluir cada formato autoral e uma atividade pronta/3D: erro com orientação, acerto com Lilo e resultado no painel.
4. Baixar a publicação 1, ficar offline, recolher/editar/publicar a 2 e enviar a resposta da 1. Conferir a versão
   no painel; a publicação 2 continua pendente até sua própria entrega.
5. Concluir offline, esperar confirmação, fechar, reabrir e reconectar. Conferir recompensa e entrega única.
6. Jogar e comprar em dois aparelhos, reconectando nas duas ordens. Conferir soma, posse e recusas sem saldo.
7. Conferir prazo, início, rascunho de avaliação, publicação da devolutiva e avisos lidos em outro aparelho.
8. Conferir teclado, texto ampliado, TalkBack, contraste, PDF e compartilhamento. Testar perda de conexão e nova tentativa.
9. Conferir manifesto final, permissões, assinatura e bibliotecas nativas, incluindo compatibilidade com páginas de 16 KB.

## Antes de dados reais e publicação pública

Continuam pendentes as definições da instituição sobre finalidade, responsável, retenção e atendimento
de pedidos, a política pública de privacidade, exportação/exclusão (MOD-SEG-011), entrega real do Resend
e o aceite físico. Login Google é uma evolução separada e não substitui a autorização escolar por vínculo.
O checklist da loja está em [publicação Android](publicacao-android.md).
