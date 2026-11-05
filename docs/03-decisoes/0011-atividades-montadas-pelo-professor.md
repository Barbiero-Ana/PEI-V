# ADR 0011 — Atividades montadas pelo professor e enviadas ao app

- **Status:** Aceita
- **Data:** 28/10/2026
- **Decisores:** a preencher pela equipe
- **Uso de IA:** auxílio na escrita do código e na organização dos campos do editor, a partir da necessidade descrita
  pela equipe. A decisão de o professor montar atividades e o que elas devem conter é da equipe.

## Contexto

O painel do professor é um sistema à parte do app do aluno, de uso exclusivo do professor. Ele se liga ao app em dois
pontos: o professor envia o que os alunos vão fazer e recebe os resultados das atividades. Até aqui, o professor só
via resultados e planejava aulas; não conseguia montar o que chega ao app.

## Decisão

O painel ganha a seção **Atividades**. O professor monta atividades em quatro formatos com questões próprias
(questão objetiva, completar lacunas, associação e sequência) ou escolhe uma atividade pronta do app (os formatos de
montar, manipular e 3D dependem do jogo do app). Cada atividade tem título, instrução, habilidade da BNCC, turmas,
data de liberação e, se quiser, o plano de aula a que pertence. Ela fica como rascunho até ser enviada.

O conteúdo de cada questão segue um formato fixo validado no servidor, que será o contrato com o app na integração:

- objetiva: enunciado, alternativas e o índice da correta;
- completar: texto com as respostas entre colchetes, como `25% de 80 é [20]`;
- associação: pares (lado A, lado B);
- sequência: itens na ordem certa (o app embaralha).

O sistema se conecta de ponta a ponta: o plano de aula mostra e cria as atividades da aula; os insights do aluno e o
quadro da turma levam a uma atividade no formato em que o aluno ou o grupo vai melhor; a agenda mostra o que entra no
app em cada dia; e os resultados das atividades alimentam o desempenho, o pentagrama e os insights.

## Alternativas consideradas

- **Só atividades prontas do app:** mais simples, mas o professor não adaptaria o conteúdo à turma.
- **Editor livre (texto e imagem soltos):** flexível, mas o app não teria como corrigir nem medir o acerto por formato,
  que é a base da análise de aprendizagem (ADR 0006).

## Consequências

- **Positivas:** o professor adapta as atividades ao que os dados mostram, sem sair do painel; o formato fixo permite
  correção automática no app e mantém a análise por formato.
- **Negativas:** até a integração (ADR 0009, etapa 5), as atividades ficam em memória no servidor e não chegam ao app.
- **O que fica pendente:** tabela de atividades na API (ADR 0007), o app ler e exibir as atividades enviadas, e o
  retorno das respostas como resultados.
