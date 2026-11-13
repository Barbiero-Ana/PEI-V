# PRD-04 — Missões do aluno

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

Catálogo define fases e formatos. A partida registra acertos de primeira, tentativas e fases com dica.

[PRD de origem](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Entender a tarefa e resolver sem medo de errar | Cenário do dia a dia, instrução curta, dica a qualquer momento e retorno encorajador |
| Aluno com dificuldade motora | Resolver sem arrastar | Alternativa por toque em toda interação de arrastar |
| Professor | Receber dados comparáveis entre formatos | Registro padronizado de cada jogada (`ResultadoJogada`) |

## Implementação

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Persistência** missao, mapa, formato_atividade, jogada.

## Regras de negócio

- **RN-01** 3 estrelas se acerto de primeira ≥ 90%; 2 se ≥ 60%; senão 1.
- **RN-06** Dica não retira pontos; influencia a autonomia.

## Testes e limites

missoes.test.ts e jogada.test.ts. Validar cada jogo no aparelho e revisar BNCC com a equipe pedagógica.

## Dependências

[PRD-05](../prd-05/README.md) · [PRD-11](../prd-11/README.md) · [PRD-14](../prd-14/README.md)

## Requisitos

- [MOD-MIS-001](mod-mis-001.md) Exibir ao aluno as missões organizadas em mapas e as atividades publicadas para a turma.
- [MOD-MIS-002](mod-mis-002.md) Indicar a situação de cada missão: bloqueada, disponível, atual ou concluída, com as estrelas obtidas.
- [MOD-MIS-003](mod-mis-003.md) Cada fase deve apresentar uma situação do cotidiano e uma instrução curta da tarefa.
- [MOD-MIS-004](mod-mis-004.md) O aluno resolve as fases por manipulação direta dos elementos da tela.
- [MOD-MIS-005](mod-mis-005.md) Toda interação de arrastar deve ter uma alternativa por toque: tocar no item e depois no destino.
- [MOD-MIS-006](mod-mis-006.md) O aluno pode pedir uma dica em qualquer fase.
- [MOD-MIS-007](mod-mis-007.md) Informar acerto ou erro imediatamente após a conferência da resposta.
- [MOD-MIS-008](mod-mis-008.md) Em caso de erro, explicar o que aconteceu e permitir nova tentativa.
- [MOD-MIS-009](mod-mis-009.md) Ao fim da missão, registrar formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas.
- [MOD-MIS-010](mod-mis-010.md) Exibir ao fim da missão as estrelas, os pontos de luz ganhos, o avanço da constelação e o resumo da jogada.
- [MOD-MIS-011](mod-mis-011.md) A tela de resultado oferece jogar de novo, voltar e seguir para a próxima missão.
- [MOD-MIS-012](mod-mis-012.md) O aluno pode sair de uma missão a qualquer momento, sem gerar registro.
- [MOD-MIS-013](mod-mis-013.md) Exibir o prazo das atividades publicadas pelo professor.
