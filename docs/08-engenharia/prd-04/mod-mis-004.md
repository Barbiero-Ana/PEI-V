# PRD do requisito MOD-MIS-004

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O aluno resolve as fases por manipulação direta dos elementos da tela.

Origem: [PRD-04 — Missões do aluno](../../02-modulos/PRD-04%20%E2%80%94%20Miss%C3%B5es%20do%20aluno.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-MIS-02 Como **aluno**, quero resolver a missão mexendo nas peças, a partir de uma situação real, para entender a Matemática no dia a dia.

- **HU-MIS-02** CA-01: Toda fase mostra o cenário do dia a dia e uma instrução curta acima da área de interação.
- **HU-MIS-02** CA-02: Dado um item arrastável, quando o aluno toca nele e depois no destino, então o item vai para o destino, como se tivesse sido arrastado.
- **HU-MIS-02** CA-03: Os botões de ação ficam fixos no rodapé, na mesma posição em todas as missões (MOD-USA-005).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/missoes.ts](../../../packages/core/src/missoes.ts)
- [apps/mobile/src/componentes/Partida.tsx](../../../apps/mobile/src/componentes/Partida.tsx)
- [apps/api/src/jogada.ts](../../../apps/api/src/jogada.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
