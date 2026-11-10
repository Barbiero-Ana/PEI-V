# MOD-MIS-002

Indicar a situação de cada missão: bloqueada, disponível, atual ou concluída, com as estrelas obtidas.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-01 Como **aluno**, quero ver as missões em mapas e saber quais já fiz, para escolher o que jogar.

- **HU-MIS-01** CA-01: Dada a tela Níveis, quando aberta, então cada missão mostra a situação (bloqueada, disponível, atual ou concluída) por ícone e texto, e as estrelas obtidas.
- **HU-MIS-01** CA-02: O mapa atual aparece aberto, e os demais podem ser expandidos.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
