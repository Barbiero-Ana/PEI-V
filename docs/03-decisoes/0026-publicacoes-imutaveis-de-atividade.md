# ADR 0026 — Publicações imutáveis de atividade

- **Status:** Aceita; homologação física pendente
- **Data:** 13/11/2026
- **Decisores:** Ana Barbiero — Líder de projeto
- **Uso de IA:** revisão do contrato, implementação e testes de concorrência, persistência e compatibilidade.

## Contexto

Uma atividade publicada ainda podia ter suas questões substituídas. Um aluno offline poderia responder
um conteúdo e enviar seu resultado quando o professor já estivesse trabalhando em outro. Conferir somente
o identificador da atividade e o formato não permite saber qual proposta foi respondida.

## Decisão

Cada envio publica um registro `atividade_publicacao` com identificador, número, conteúdo e turmas
preservados. A API serializa edição, publicação e arquivamento pelo bloqueio da atividade. Dois envios
concorrentes de uma publicação ativa retornam a mesma versão. Recolher, editar e enviar novamente cria
outra versão. A comparação canônica do conteúdo fica no núcleo compartilhado.

O conteúdo de uma publicação ativa não pode ser substituído pelo formulário nem pela API. Apenas o prazo
é editável; a alteração é auditada. O papel do banco só tem permissão de atualização na coluna `prazo` da
publicação. O app recebe o conteúdo preservado e guarda a versão ao iniciar. Início e resultado levam
`publicacaoId`; entregas offline são verificadas contra essa publicação e seus destinatários e prazo,
mesmo depois de recolhimento, republicação ou arquivamento. O título e a habilidade da avaliação posterior
vêm da versão respondida. Entregas de outra versão não concluem automaticamente a publicação atual.

A migração registra o conteúdo legado atualmente publicado como **observado na migração**. Não atribui
versões a jogadas antigas, nem inventa o conteúdo de rascunhos que já foram recolhidos. As jogadas antigas
permanecem legíveis e sem versão. Novas entregas do professor exigem versão válida; pendências antigas
sem essa referência são preservadas como recusadas, com orientação para atualizar o app e falar com a equipe.

## Alternativas consideradas

- Manter apenas formato e atividade: permite confundir conteúdos diferentes do mesmo formato.
- Apagar questões antigas: perde a referência pedagógica das respostas e devolutivas.
- Atribuir toda jogada histórica à versão atual: cria um histórico que não pode ser comprovado.

## Consequências

A atividade com publicação é arquivada ao excluir. Conteúdo e histórico permanecem preservados. O banco
recebe uma migração aditiva e os inícios passam a ser registrados por publicação, mantendo registros legados.
Atualizar API e painel antes de distribuir o APK novo. O aceite em aparelhos e a revisão pedagógica permanecem
no roteiro. Esta decisão complementa os [ADRs 0024](0024-progresso-por-operacoes-confirmadas.md) e
[0025](0025-ciclo-de-atividades-e-devolutivas.md).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Escopo:** implementação técnica e organização documental solicitadas nesta conversa; aceite físico pendente.
