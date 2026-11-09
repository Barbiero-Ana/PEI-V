# PRD-10 — Histórico e sincronização

A fila é separada por aluno. A API retorna confirmações por ID e o app guarda recusas separadas de pendências.

[PRD de origem](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Jogar sem depender do Wi-Fi | Progresso salvo no aparelho |
| Aluno | Não perder o progresso ao trocar de celular | Recuperação pelo servidor (fase 4) |
| Professor | Ver todas as jogadas da turma | Envio automático ao servidor quando houver conexão |

## Implementação

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Persistência** jogada e tabelas de progresso.

## Regras de negócio

- **RN-20** Cada jogada tem um identificador gerado no aparelho; o servidor ignora um identificador já recebido (evita duplicidade).

## Testes e limites

Testes de isolamento e de validação da jogada. Persistência atômica da recompensa com a fila e recuperação integral entre aparelhos pendentes.

## Dependências

[PRD-17](../prd-17/README.md)

## Requisitos

- [MOD-HIS-001](mod-his-001.md) Manter o histórico de jogadas e avaliações de cada aluno.
- [MOD-HIS-002](mod-his-002.md) O professor consulta o histórico dos alunos das suas turmas.
- [MOD-HIS-003](mod-his-003.md) O aluno consulta o próprio histórico.
- [MOD-HIS-004](mod-his-004.md) As missões podem ser jogadas sem conexão com a internet, com o progresso salvo no aparelho.
- [MOD-HIS-005](mod-his-005.md) As jogadas feitas sem conexão são enviadas ao servidor quando a conexão é restabelecida.
- [MOD-HIS-006](mod-his-006.md) Ao entrar em outro aparelho, o aluno recupera seu progresso.
