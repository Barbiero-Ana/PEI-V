# ADR 0004 — Última estrela da constelação só com o mapa completo

- **Status:** Aceita
- **Data:** 09/10/2026
- **Decisores originais:** não identificados no registro histórico.

## Contexto

Cada mapa monta uma constelação, e a cada 5 pontos de luz uma estrela acende. Nos testes, foi possível completar
a constelação repetindo várias vezes a mesma missão, sem jogar as outras do mapa. Isso esvaziava a proposta do
projeto: a análise de aprendizagem precisa de jogadas em formatos diferentes.

## Decisão

Os pontos de luz acendem as estrelas só até a penúltima. A última estrela acende apenas quando todas as missões
do mapa forem concluídas, e então a constelação vai para o álbum. Ao abrir o app, constelações marcadas como
completas sem o mapa concluído são corrigidas.

## Alternativas consideradas

- **Só os pontos contam:** permite completar o mapa repetindo a missão mais fácil.
- **Bloquear a repetição de missões:** impediria o aluno de treinar o que achou difícil.

## Consequências

- **Positivas:** o aluno é levado a experimentar todos os formatos do mapa, o que melhora a análise para o
  professor; repetir missões continua valendo como treino.
- **Negativas:** a regra precisa ser explicada na tela ("a última estrela acende ao terminar o mapa").
- **Verificação:** coberta pelos testes em `packages/core/src/constelacoes.test.ts`.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
