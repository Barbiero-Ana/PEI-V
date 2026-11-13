# ADR 0024 — Progresso por operações confirmadas

- **Status:** Aceita; homologação física pendente
- **Data:** 11/11/2026
- **Decisores:** equipe responsável pelo produto
- **Uso de IA:** implementação solicitada, revisão das transações e testes de concorrência.

## Contexto

Comparar totais por `Math.max` perde a contribuição de aparelhos que jogaram separadamente. Somar retratos
inteiros também duplica ganhos quando uma solicitação é reenviada. Compras concorrentes precisam compartilhar
o saldo e um item permanente não pode ser debitado duas vezes.

## Decisão

- `POST /aluno/sincronizar` serializa as operações do aluno com bloqueio da sua linha. A gravação da jogada,
  o crédito e as compras pertencem à mesma transação. O ID estável da jogada impede o crédito duplicado.
- O núcleo calcula a projeção de progresso e mantém os preços. O servidor confirma a posse e o débito de
  cada item. Duas compras diferentes são confirmadas quando há saldo conjunto. Uma compra sem saldo é
  recusada explicitamente, sem cobrança; o app informa a recusa e retira o item recusado do perfil equipado.
- O servidor devolve uma revisão e a projeção confirmada. O app reaplica somente operações locais pendentes,
  preservando também as produzidas durante o envio. Uma resposta antiga não substitui uma revisão recente.
  Confirmação, remoção da fila e novo progresso são gravados juntos no aparelho.
- A migração captura um retrato legado antes das novas jogadas. Ele é importado uma vez por instalação como
  piso histórico. Jogadas anteriores não são recompensadas novamente. O protocolo antigo de envio de totais
  recebe conflito após a adoção do novo protocolo para impedir a sobrescrita da consolidação.

## Bonificações e independência da ordem

O dobro do desafio diário é consolidado pela **melhor recompensa base daquele desafio no dia**, uma vez por
data. Uma tentativa posterior pode melhorar esse único bônus. Isso substitui a escolha pela primeira chegada
ao servidor, que dependia da ordem de reconexão. O preenchimento da constelação é um piso: os créditos
posteriores substituem o complemento antes de ultrapassá-lo. Os complementos ficam discriminados no banco.
Os testes com as duas ordens de reconexão verificam o mesmo total. A equipe deve homologar essa apresentação
das bonificações na interface.

## Consequências

- Implantar as migrações e a API antes de distribuir o app atualizado. Evitar misturar versões de app em uma
  conta já migrada. Os APKs gerados antes desta alteração não implementam o novo protocolo.
- Os totais históricos não permitem reconstruir ganhos que versões anteriores já perderam e que não tenham
  sido registrados individualmente. A migração preserva a base disponível; não inventa eventos históricos.
- Compras offline são projeções até a confirmação. Saldo gasto simultaneamente em outro aparelho pode
  impedir a confirmação de uma delas. A posse já confirmada de um mesmo item é reutilizada sem novo débito.

Relacionados: [ADR 0022](0022-conclusao-local-atomica.md) ·
[Roteiro e implantação](../08-engenharia/consolidacao-funcional.md).

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Registro:** aprovação expressa nesta conversa para organizar e consolidar a documentação.
- **Histórico:** a data original da decisão no cabeçalho foi preservada. Esta assinatura não atribui
  participação retroativa nem reativa decisões substituídas; evidências de homologação continuam separadas.
