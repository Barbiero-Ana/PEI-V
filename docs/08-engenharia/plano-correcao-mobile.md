# Vistoria e plano de correção do app do aluno

11/11/2026 · Expo SDK 58 · PostgreSQL de teste

O [ADR 0021](../03-decisoes/0021-portal-da-equipe-e-app-nativo.md) define o app para Android e iOS e o portal web
da equipe. O [roteiro da Google Play](publicacao-android.md) acompanha a preparação da versão Android.

| Prioridade | Situação | Critério de aceite |
| --- | --- | --- |
| P0 | **Criação de PIN e bloqueio concorrentes.** A API atualiza condicionalmente o PIN, a versão de acesso e o contador de falhas. Zerar o PIN invalida as sessões antigas. | O PostgreSQL confirmou um único PIN inicial quando duas solicitações usam PINs diferentes. Cinco falhas concorrentes bloquearam a entrada. Conferir o fluxo de redefinição no aparelho. |
| P0 | **Recompensa e jogada pendente.** O app persiste ambas em uma escrita local por identidade e mostra a conclusão após a gravação (ADR 0022). | Os testes simulam falha de gravação e reabertura. A API confirmou reenvio por ID sem duplicidade. Repetir em modo avião, fechando o app após a confirmação visual. |
| P0 | **Consolidação entre aparelhos.** O protocolo novo soma créditos por ID e confirma compras sob bloqueio por aluno, na mesma transação do histórico. O núcleo mantém preços e bônus; a migração conserva a base legada (ADR 0024). | O PostgreSQL confirmou soma nas duas ordens, um débito por item e recusa sem saldo. Jogar offline em dois aparelhos, reconectar nas duas ordens e confirmar os mesmos totais e compras. |
| P0 | **Ciclo da atividade.** Em PostgreSQL, o rascunho ficou fora da lista do aluno, o professor publicou, o aluno recebeu o feedback da questão, a jogada foi reenviada sem duplicidade e o professor consultou o resultado. | Repetir na interface com todos os formatos autorais e atividade pronta. Testar rascunho, liberação programada, erro com orientação, mensagem do Lilo e resultado no painel. |
| P1 | **Credencial local.** A sessão usa SecureStore. A migração remove as cópias antigas do token e preserva a fila e o progresso local (ADR 0023). | Os testes simulam migração, interrupção e reinstalação. Validar atualização de uma instalação anterior, reabertura, logout e troca de conta em um build Android e iOS. |
| P1 | **Falha ao buscar atividades.** A aba distingue erro, dados guardados e lista vazia confirmada. | Conferir em modo avião, com resposta 500, sessão expirada e turma sem atividades. Confirmar o botão de nova tentativa. |
| P2 | **Prazo, andamento, devolutivas e avisos.** O ciclo foi implementado com versões privadas/publicadas e leitura dos avisos do aluno persistida no banco (ADR 0025). | A suíte de banco confirmou privacidade, publicação, prazo e início. Homologar as interfaces e conferir os aceites de [atividades](prd-14/README.md), [feedback](prd-15/README.md) e [notificações](prd-16/README.md). |
| P2 | **Revisão publicada de uma atividade.** O envio confere turma e formato. Falta vincular a jogada à revisão efetivamente publicada. | Recusar envio referente a um rascunho e aceitar o reenvio offline de uma revisão que foi publicada e depois recolhida. |

## Roteiro de homologação em aparelho

1. Use uma base isolada com duas contas fictícias do aluno, um professor e uma turma. Abra a mesma API HTTPS
   no app e no painel. No portal, confira os três papéis e seus vínculos. No app, teste **Experimentar demonstração**,
   conclua uma missão e confira que o resultado fica local.
2. No primeiro acesso escolar, cole o código no formato `AAAA-1111`. Repita em minúsculas e sem hífen. Teste
   um PIN fraco e a confirmação com números diferentes. Crie um PIN válido. Feche e reabra. Saia uma vez e
   verifique a tela de entrada. Entre como segundo aluno e confira que o histórico, avatar e atividades são próprios.
3. No painel, monte uma atividade com feedback para cada questão. Salve como rascunho e confirme que fica
   fora da lista do aluno. Publique para hoje. Em **Professor**, abra a atividade, erre uma questão e confira
   a orientação cadastrada. Acerte e confira a mensagem do Lilo no fim da tela.
4. Depois de carregar a atividade, ative o modo avião. Conclua, espere a tela de confirmação e feche o app.
   Reabra, reconecte e confirme no painel que há uma entrega com o acerto esperado. Repita com missão do mapa
   e confira a recompensa e o histórico após reabrir. Teste também abrir a aba **Professor** sem dados em cache
   e sem internet. Após reconectar, use **Tentar novamente**.
5. No Android e no iOS, confira TalkBack ou VoiceOver, texto ampliado, teclado, jogos 3D e abertura e
   compartilhamento do PDF. Registre aparelho, versão, passo, resultado esperado e resultado observado.

A validação automatizada cobre o fluxo na API e a persistência local simulada. O aceite em aparelhos físicos e
o teste da versão assinada continuam pendentes. Use apenas contas e dados fictícios na homologação.
