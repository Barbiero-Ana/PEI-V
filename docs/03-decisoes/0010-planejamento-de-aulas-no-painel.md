# ADR 0010 — Planejamento de aulas no painel do professor

- **Status:** Aceita
- **Data:** 27/10/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** auxílio na escrita do código e na organização dos campos do plano de aula, a partir da necessidade
  descrita pela equipe. A decisão de incluir o planejamento e o que ele deve conter é da equipe.

## Contexto

O painel foi pensado primeiro para o professor **ver** o desempenho dos alunos. A equipe definiu que ele também deve
servir para **agir** sobre o que vê: planejar as próximas aulas, escolher os formatos de atividade e marcar os alunos
que precisam de acompanhamento. Sem isso, o professor teria que levar os dados do Modolume para outra ferramenta e o
painel não cumpriria o papel de ponte entre aluno e professor. A equipe também pediu um visual mais institucional,
próximo dos sistemas de gestão escolar, com mais campos e tabelas.

## Decisão

O painel ganha a seção **Planejamento**, com lista de planos de aula, calendário mensal, formulário de plano e registro
da aula. O plano tem turma, data, horário, duração, tema, unidade temática e habilidades da BNCC, objetivos, conteúdos,
metodologia, formatos de atividade, recursos, avaliação, alunos em acompanhamento, observações, situação (rascunho,
planejada, realizada) e o registro do que aconteceu na aula.

O formulário mostra os dados ao lado das escolhas: o acerto da turma em cada formato de atividade e os alunos que pedem
atenção, com o motivo. As fichas do aluno e da turma levam direto a um plano novo, já com a turma e o aluno marcados.

Até a integração com a API (etapa 5 da ADR 0009), os planos ficam em memória no servidor, com alguns exemplos.

## Alternativas consideradas

- **Deixar o planejamento fora do painel:** mais simples, mas separa o dado da decisão pedagógica, que é o objetivo
  do projeto.
- **Plano de aula com texto livre só:** mais rápido de preencher, mas não permite ligar o plano aos formatos, às
  habilidades e aos alunos, nem filtrar ou contar depois.
- **Guardar os planos no navegador:** sobreviveria a reinícios do servidor, mas cada aparelho teria uma versão
  diferente. Como a API vem na etapa 5, a memória do servidor basta para a demonstração.

## Consequências

- **Positivas:** o professor vê os dados e planeja no mesmo lugar; cada plano registra por que um formato ou aluno foi
  escolhido; o registro pós-aula cria um histórico da turma.
- **Negativas:** mais telas para manter; enquanto não há API, os planos voltam aos exemplos quando o servidor reinicia.
- **O que fica pendente:** tabela de planos de aula no banco (ADR 0007) e rotas na API; revisar com professores a lista
  de habilidades da BNCC (hoje um recorte do 6º ano, com o texto resumido).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
