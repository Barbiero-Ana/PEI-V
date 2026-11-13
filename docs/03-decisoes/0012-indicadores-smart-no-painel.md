# ADR 0012 — Indicadores SMART no painel do professor

- **Status:** Aceita
- **Data:** 04/11/2026
- **Decisores originais:** não identificados no registro histórico.
- **Uso de IA:** auxílio na escrita do código, dos testes e da redação das definições, a partir da orientação do
  professor orientador de que os indicadores fossem SMART. As metas propostas dependem de aprovação da equipe.

## Contexto

O painel mostrava números como "65% de acerto médio" sem dizer se isso era bom ou ruim, em que período foi medido nem
o que o professor deveria fazer. O professor orientador pediu que os indicadores apresentados ao professor fossem
**SMART**: específicos, mensuráveis, atingíveis, relevantes e com prazo.

## Decisão

Criar no núcleo (`packages/core/src/indicadores-smart.ts`) seis indicadores por turma, IND-01 a IND-06: acerto médio,
alunos abaixo de 60%, formato com menor acerto, conclusão, participação e tentativas por atividade. Cada um tem:

- definição escrita de cada parte SMART e uma ação sugerida;
- meta com sentido (mínimo ou máximo) e tolerância para "perto da meta";
- janela de 4 semanas terminando na atividade mais recente, comparada com as 4 semanas anteriores, e data da próxima
  revisão;
- situação escrita: atingida, perto, abaixo ou sem dados.

O painel mostra os indicadores na aba **Metas** da turma e o resumo ("3 de 6 atingidas") nos cartões da Visão geral. O
texto exibido sai da mesma constante do núcleo, para a documentação ([[PRD-12 — Painel do professor]], RN-13) e a tela
não divergirem.

## Alternativas consideradas

- **Manter os números sem meta:** mais simples, mas não atende ao pedido e não orienta a ação.
- **Metas definidas por cada professor desde já:** mais flexível, mas exige cadastro e banco (fase 4); fica como
  pendência.
- **Janela pelo mês do calendário:** fácil de explicar, mas mistura meses com poucos dados; 4 semanas móveis dão uma
  base mais estável.
- **Calcular no próprio painel (web):** duplicaria regras; o núcleo garante o mesmo cálculo para a futura API
  (ADR 0001).

## Consequências

- **Positivas:** todo indicador diz o que mede, qual a meta, o período e o que fazer; os cálculos têm testes
  automatizados; a definição exibida é a mesma da documentação.
- **Negativas:** metas fixas podem não servir para todas as turmas; a janela usa a data da atividade mais recente, e não
  a de hoje, para funcionar com os dados de demonstração.
- **O que fica pendente:** aprovar as metas, decidir se o professor poderá ajustá-las e, com a API, incluir indicadores
  de dicas e de domínio (RN-07).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
