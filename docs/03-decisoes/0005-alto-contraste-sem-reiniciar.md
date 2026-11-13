# ADR 0005 — Alto contraste aplicado sem reiniciar o app

- **Status:** Aceita (substitui a solução inicial, que reiniciava o app)
- **Data:** 09/10/2026
- **Decisores originais:** não identificados no registro histórico.

## Contexto

O app tem uma opção de alto contraste para alunos com baixa visão. Na primeira versão, as cores eram fixadas
quando o app abria, então ligar o alto contraste reiniciava o app e o aluno perdia a tela em que estava. Para
quem mais precisa do recurso, isso era uma barreira.

## Decisão

As cores passam a ser lidas sempre da paleta ativa (`tema.ts`). Os estilos são criados com `criarEstilos` e as
tabelas de cores com `porTema`, que se recalculam quando a paleta muda. Ao trocar o contraste, as telas são
redesenhadas, e a navegação continua no mesmo lugar.

## Alternativas consideradas

- **Reiniciar o app (solução inicial):** simples, mas interrompe o aluno.
- **Passar o tema por contexto em cada componente:** exigiria reescrever todas as telas e estilos.

## Consequências

- **Positivas:** o contraste muda na hora, sem perder a tela; a troca de paleta passou a servir para outros
  temas no futuro.
- **Negativas:** estilos novos precisam usar `criarEstilos` ou `porTema`; um estilo criado de outro jeito não
  acompanha a troca.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
