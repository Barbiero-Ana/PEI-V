# ADR 0022 — Conclusão local atômica

- **Status:** Aceita
- **Data:** 09/11/2026
- **Decisores:** equipe do projeto
- **Uso de IA:** análise da janela de perda, implementação e teste de persistência.

## Contexto

O app gravava a recompensa da missão e a jogada pendente em chaves diferentes. Uma interrupção entre as
escritas podia preservar só parte da conclusão.

## Decisão

- Guardar os snapshots de jogador e conta em uma entrada local por identidade. As escritas da identidade são
  enfileiradas e a conclusão grava os dois snapshots de uma vez.
- Restaurar os dados das chaves anteriores de cada identidade quando a seção ainda não tiver sido gravada no
  novo formato. Uma falha de gravação interrompe a fila local até a reabertura para evitar persistência parcial.
- Exibir o resultado após a gravação local. A fila envia a jogada com seu ID original até receber confirmação.

## Alternativas consideradas

- Um diário de recuperação também permitiria recompor as duas chaves. A entrada única exige uma gravação para
  concluir a missão e preserva os dados existentes por leitura compatível.

## Consequências

- A atomicidade vale para a conclusão no aparelho. O envio de jogadas e o envio dos totais de gamificação
  continuam sendo operações distintas na API.
- A consolidação entre aparelhos precisa de um registro de ganhos e compras por identificador e de uma regra
  para dados legados. O [plano de correção](../08-engenharia/plano-correcao-mobile.md) registra o aceite pendente.

Relacionado: [ADR 0003](0003-progresso-local-e-uso-sem-conexao.md).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
