# ADR 0006 — Análise de aprendizagem pelo domínio de cada formato

- **Status:** Aceita
- **Data:** 13/10/2026
- **Decisores originais:** não identificados no registro histórico.

## Contexto

O objetivo do Modolume é mostrar ao professor em quais formatos de atividade cada aluno compreende melhor. A
primeira versão usava só a média do melhor acerto, e uma única jogada já era apresentada como "o forte" do
aluno. Isso podia rotular o aluno com base em pouca informação.

## Decisão

Para cada formato, considerar as 10 jogadas mais recentes e combinar três sinais numa nota de domínio:

- domínio = 65% acerto de primeira + 20% autonomia (fases sem dica) + 15% precisão (tentativas por fase);
- níveis: 75 ou mais = vai muito bem; 50 a 74 = está crescendo; abaixo de 50 = vale treinar;
- tendência: diferença de 12 pontos ou mais entre a primeira e a segunda metade das jogadas;
- o jeito de aprender principal só aparece com pelo menos 2 jogadas e 6 fases do formato e domínio médio de 60
  ou mais.

O cálculo fica em `packages/core/src/aprendizagem.ts` e é o mesmo para o aluno e para o professor.

## Alternativas consideradas

- **Só o acerto final:** sempre chega a 100%, porque o aluno pode tentar de novo; não diferencia ninguém.
- **Só o acerto de primeira:** ignora quanto o aluno depende das dicas.
- **Rótulos fixos de estilo de aprendizagem:** classificariam o aluno, o que o projeto quer evitar.

## Consequências

- **Positivas:** leitura mais completa e mais justa; nenhuma conclusão com pouco dado; resultado apresentado
  como referência, não diagnóstico.
- **Negativas:** os pesos (65/20/15) e os limites são uma primeira proposta.
- **Pendente:** ajustar os pesos com dados reais de uso e a opinião dos professores.
- **Verificação:** coberta pelos testes em `packages/core/src/aprendizagem.test.ts`.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
