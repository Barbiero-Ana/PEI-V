# Consolidação de progresso, aprendizagem e atividades

11/11/2026 · Implementação local para homologação

## Organização

| Responsabilidade | Código |
| --- | --- |
| Recompensas, preços e compra | `packages/core/src/progresso.ts` |
| Análise e adaptação das medidas | `packages/core/src/aprendizagem.ts` e `aprendizagem-painel.ts` |
| Transação de sincronização | `apps/api/src/sincronizacao-aluno.ts` e `progresso-aluno.ts` |
| Conciliação local e proteção contra resposta antiga | `apps/mobile/src/estado/progresso-local.ts` |
| Avaliações e autorização | `apps/api/src/avaliacoes.ts` |
| Avisos e leitura persistida | `apps/api/src/avisos-aluno.ts` |
| CI e lint da API | `.github/workflows/qualidade.yml` e `apps/api/eslint.config.mjs` |

As regras ficam no núcleo sem dependências de interface. Os controladores adicionais separam sincronização,
avaliações e avisos dos cadastros e planos existentes. Os providers móveis orquestram a persistência e a rede.
O [ADR 0024](../03-decisoes/0024-progresso-por-operacoes-confirmadas.md) descreve o protocolo e a transição;
o [ADR 0025](../03-decisoes/0025-ciclo-de-atividades-e-devolutivas.md) descreve prazos e devolutivas.

## Aprendizagem

App e painel chamam `analisarAprendizagem`. A API e a adaptação web preservam rodadas, acertos de primeira,
tentativas e dicas. A ordem é data e ID estável, tomando as últimas dez jogadas por formato. O domínio usa
65% de acerto, 20% de autonomia e 15% de precisão. O app mostra os formatos; o painel agrupa os formatos
nos cinco jeitos. Para um jeito, as medidas com confiança boa têm preferência; sem elas o valor é mostrado
como amostra pequena. A comparação da turma dá peso igual a cada aluno com dados. Acerto médio continua
disponível nas tabelas de desempenho, identificado como acerto.

## Migrações e implantação

**Atualização de 13/11/2026:** o backup foi restaurado e as duas migrações foram aplicadas no Railway.
API e painel foram publicados, e a CI remota passou. O [registro da execução](implantacao-2026-11-13.md)
documenta evidências, testes dos três perfis e as validações ainda pendentes no aplicativo.

1. Ensaiar backup e restauração e aplicar as duas migrações novas em homologação:
   `20261111120000_consolidacao_progresso` e `20261111130000_ciclo_atividades`.
2. Gerar Prisma e implantar a API com os novos controladores. As variáveis de serviço existentes permanecem
   aplicáveis. Esta entrega não configura novas chaves ou serviços externos.
3. Implantar o painel depois da API. Verificar o formulário de prazo, situação por aluno e avaliação.
4. Gerar outro APK/AAB com `versionCode` 3 ou superior. Os artefatos anteriores, código 2, não contêm estas
   funcionalidades. Atualizar os aparelhos de uma conta antes de usar o novo protocolo.
5. Registrar o aceite nos aparelhos. A implementação e os testes locais não representam implantação no
   Railway/Vercel nem execução remota da esteira de CI.

## Roteiro de aceite

1. Entre com o mesmo aluno fictício em dois aparelhos. Jogue missões distintas sem conexão. Reconecte A e B,
   confira a soma e repita com B e A. Reabra e confira tentativas, histórico, luzes e conquistas.
2. Com saldo suficiente, compre itens diferentes nos dois aparelhos e sincronize. Compre também o mesmo
   item nos dois: deve haver uma posse e um débito. Com saldo conjunto insuficiente, conferir a recusa
   explícita e o saldo sem cobrança da compra recusada.
3. Envie uma atividade com prazo. Abra e saia sem concluir: o painel deve mostrar em andamento. Conclua e
   confira as fases. Uma atividade encerrada não deve abrir uma nova partida.
4. Salve avaliação em rascunho e confirme que ela não aparece para o aluno. Publique uma orientação e confira
   o aviso, o texto no app e o histórico no painel. Marque todos os avisos como lidos e confira em outro aparelho.
5. Compare o domínio do mesmo formato com o mesmo histórico no app e no painel. As tabelas de acerto
   continuam medindo acerto; não comparar esse número diretamente com domínio.

## Evidências automatizadas

`scripts/aprendizagem-web.test.ts` impede que o arredondamento do pentagrama troque a indicação principal do núcleo.
`progresso.test.ts` cobre as duas ordens de eventos, bônus e compras. `aprendizagem-painel.test.ts` cobre
paridade das medidas, ordenação e validação. `progresso-local.test.ts` cobre confirmação, operações durante
o envio, recusa de compra e migração de histórico. `autorizacao-consolidacao.test.ts` exercita as novas rotas
HTTP. `verificar-consolidacao.ts`, chamado pela suíte de banco descartável, cobre concorrência, rollback,
prazo, avaliação privada/publicada, leitura por aluno e preservação após excluir a atividade. A suíte executa
`prisma migrate deploy` duas vezes em outra base descartável.

A CI usa lockfile congelado e não recebe segredos de produção. Executa lint, tipagem, testes, migrações,
build web, verificação das rotas protegidas e exportação do bundle Android. A primeira execução no GitHub
e os aceites visuais em aparelhos ainda precisam ser registrados após enviar as alterações.

Na revisão local passaram 55 testes do núcleo, 72 da API, 24 do mobile e um teste de contrato entre núcleo e painel (152 ao todo), a suíte PostgreSQL, lint, tipagem,
formatação, build web, verificação das rotas protegidas e exportação Android pelo Metro/Hermes. O relatório
detalhado e os limites estão na [auditoria de 11/11](auditoria.md#consolidação-funcional-em-11112026).
