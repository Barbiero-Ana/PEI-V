# MOD-MIS-009

Ao fim da missão, registrar formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-05 Como **professor**, quero que cada jogada seja registrada do mesmo jeito, para comparar os formatos.

- **HU-MIS-05** CA-01: Dada uma missão concluída, então o registro contém formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas.
- **HU-MIS-05** CA-02: Dada uma missão com 10 fases e 9 acertos de primeira, então o percentual de acerto é 90% e o aluno recebe 3 estrelas (RN-01).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
