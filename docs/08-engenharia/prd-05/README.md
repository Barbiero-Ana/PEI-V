# PRD-05 — Gamificação

As regras de luzes e constelações ficam no núcleo. A loja e a projeção offline ficam no estado do jogador.

[PRD de origem](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Sentir progresso e ter motivo para voltar | Constelações, pontos de luz, desafio do dia, dias de luz, conquistas, mascote |
| Aluno com dificuldade | Não ser comparado nem punido | Sem ranking; sem perda de pontos; calendário sem punição |
| Professor | Que o aluno jogue formatos variados | Última estrela só com o mapa completo (ADR 0004) |

## Implementação

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Persistência** ponto_mapa, progresso_missao, constelacao_conquistada, desafio_concluido, compra_loja.

## Regras de negócio

- **RN-02** Pontos de luz = fases + acertos de primeira + 3.
- **RN-03** A cada 5 pontos de luz no mapa, acende uma estrela, até a penúltima.
- **RN-04** A última estrela só acende com todas as missões do mapa concluídas; a constelação vai para o álbum.
- **RN-05** O próximo mapa é liberado ao concluir o anterior, salvo liberação pelo professor.
- **RN-10** Itens comprados são permanentes; luzes gastas não voltam.
- **RN-11** O desafio do dia é igual para todos na data e dobra os pontos uma vez por dia.

## Testes e limites

constelacoes.test.ts. Consolidação aditiva e validação do saldo entre aparelhos pendentes.

## Dependências

[PRD-04](../prd-04/README.md) · [PRD-07](../prd-07/README.md)

## Requisitos

- [MOD-GAM-001](mod-gam-001.md) Liberar cada mapa quando o anterior for concluído.
- [MOD-GAM-002](mod-gam-002.md) Atribuir pontos de luz a cada missão concluída, conforme a RN-02.
- [MOD-GAM-003](mod-gam-003.md) Acender as estrelas da constelação do mapa conforme a RN-03 e a RN-04.
- [MOD-GAM-004](mod-gam-004.md) Manter um álbum de constelações, com explicação, meses de visibilidade no céu do Brasil e curiosidades.
- [MOD-GAM-005](mod-gam-005.md) Sortear diariamente um desafio do dia, conforme a RN-11.
- [MOD-GAM-006](mod-gam-006.md) Registrar e exibir em calendário os dias em que o aluno jogou, sem punição por dias sem jogar.
- [MOD-GAM-007](mod-gam-007.md) Conceder conquistas por marcos de progresso, mostrando quanto falta para cada uma.
- [MOD-GAM-008](mod-gam-008.md) O aluno pode trocar luzes por itens do avatar e capas do perfil; itens comprados ficam liberados permanentemente.
- [MOD-GAM-009](mod-gam-009.md) O mascote reage ao contexto (acerto, erro, dica e comemoração) e evolui conforme as estrelas acesas.
- [MOD-GAM-010](mod-gam-010.md) No primeiro acesso, apresentar o mascote, o céu e os mapas, com opção de pular.
- [MOD-GAM-011](mod-gam-011.md) Não exibir classificação (ranking) entre alunos.
