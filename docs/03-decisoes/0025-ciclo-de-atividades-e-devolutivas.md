# ADR 0025 — Ciclo de atividades e devolutivas

- **Status:** Aceita; homologação física pendente
- **Data:** 11/11/2026
- **Decisores:** equipe responsável pelo produto
- **Uso de IA:** implementação dos contratos, persistência, interfaces e testes.

## Contexto

A entrega concluída não informa quem iniciou uma atividade. A orientação imediata por erro de questão
não substitui a avaliação posterior do professor. Publicar rascunhos ou alterar uma avaliação histórica
destruiria a confiança na devolutiva.

## Decisão

- Registrar o primeiro início separadamente da jogada. O painel distingue não iniciada, em andamento e
  concluída. O início pode ficar na fila quando o aparelho está offline.
- A data limite é opcional, posterior ou igual à liberação e inclusiva. O calendário escolar usa
  `America/Sao_Paulo`, como a API já usava. App e painel usam a mesma função, inclusive em hosts UTC.
  O app impede novas partidas após o prazo. Reenvios já confirmados continuam idempotentes; uma entrega
  offline concluída dentro do prazo pode chegar depois. Datas do aparelho não constituem prova antifraude.
- Guardar, nas novas entregas, tentativas, tempo e uso de dica por fase. Entregas antigas sem essas medidas
  mostram essa ausência. Não reconstruir tempos nem autonomia a partir do acerto.
- Cada salvamento da avaliação cria uma versão. Rascunhos ficam restritos ao autor autorizado. A publicação
  exige texto e passa a aparecer para o aluno. Guardar título e habilidade do momento da avaliação.
- A avaliação é imutável para o papel de execução no PostgreSQL. Atividades com avaliações são arquivadas
  ao excluir; as devolutivas permanecem no histórico.
- Oferecer central de avisos **dentro do app**, sem push nesta entrega. Os avisos derivam da publicação,
  das avaliações concluídas e do prazo do dia seguinte. A leitura fica no banco por aluno e aviso.
  A fila local de leitura permite marcar um ou todos sem conexão e sincronizar depois.

## Consequências

- Um aparelho desconectado recebe avisos novos na próxima atualização com conexão. Não há promessa de
  entrega em segundo plano. A escolha de push fica para uma entrega específica.
- O lembrete de prazo aparece uma vez por atividade/data e não é oferecido a quem já concluiu. Nenhum
  rascunho de avaliação é incluído nas respostas da API do aluno.
- O histórico completo da autoria de conteúdo e revisões publicadas das questões continua sendo um
  trabalho separado. Alterar questões após uma execução offline ainda exige política de versão de conteúdo.

Relacionados: [PRD-14](../02-modulos/PRD-14%20—%20Atividades%20do%20professor.md) ·
[PRD-15](../02-modulos/PRD-15%20—%20Avaliação%20e%20feedback.md) ·
[PRD-16](../02-modulos/PRD-16%20—%20Notificações.md).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
