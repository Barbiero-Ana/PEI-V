# PRD-06 — Experiência do aluno

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

A navegação do aluno apresenta mapas, conquistas, perfil e atividades da turma em abas.

[PRD de origem](../../02-modulos/PRD-06%20%E2%80%94%20Experi%C3%AAncia%20do%20aluno.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Saber o que jogar agora | Próxima missão em destaque na tela inicial |
| Aluno | Ver o caminho percorrido | Trilha de mapas com missões concluídas, atual e bloqueadas |
| Aluno | Receber orientação do professor | Feedbacks recentes na tela inicial |

## Implementação

- [apps/mobile/src/app/(abas)](../../../apps/mobile/src/app/(abas))
- [apps/mobile/src/componentes/BarraAbas.tsx](../../../apps/mobile/src/componentes/BarraAbas.tsx)

**Persistência** missao, mapa, jogada.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

Início mostra a devolutiva publicada e acesso aos avisos. Teste de tarefa e acessibilidade em celular pendentes.

## Dependências

[PRD-04](../prd-04/README.md) · [PRD-05](../prd-05/README.md) · [PRD-15](../prd-15/README.md)

## Requisitos

- [MOD-ALU-001](mod-alu-001.md) A tela inicial exibe nome e avatar, luzes, o céu do mapa atual, as próximas missões e o desafio do dia.
- [MOD-ALU-002](mod-alu-002.md) Destacar a próxima missão recomendada, que abre com um toque.
- [MOD-ALU-003](mod-alu-003.md) Exibir todos os mapas em forma de trilha, indicando missões concluídas, atual e bloqueadas.
- [MOD-ALU-004](mod-alu-004.md) Reunir em uma tela as conquistas, os dias de luz e a análise de aprendizagem.
- [MOD-ALU-005](mod-alu-005.md) A tela inicial exibe os feedbacks recentes do professor.
- [MOD-ALU-006](mod-alu-006.md) O aluno consulta as missões já realizadas e as estrelas obtidas.
- [MOD-IU-001](mod-iu-001.md) O aplicativo tem navegação inferior com as seções Início, Níveis, Professor, Conquistas e Perfil.
- [MOD-IU-002](mod-iu-002.md) As telas de jogo apresentam enunciado, botão de dica, área de interação e ações fixas no rodapé.
