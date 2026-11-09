# MOD-APR-005

Representar o resultado em um radar (pentagrama) com um eixo por jeito de aprender (Visual, Mãos na massa, Lógico, Simbólico e Espacial), cada um agrupando formatos de atividade.

Origem: [PRD-11 — Análise de aprendizagem](../../02-modulos/PRD-11%20%E2%80%94%20An%C3%A1lise%20de%20aprendizagem.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-APR-01 Como **professor**, quero ver em que jeito de aprender cada aluno vai melhor, para escolher o formato das atividades.

- **HU-APR-01** CA-01: A ficha do aluno no painel mostra o pentagrama com os cinco jeitos, comparado com a média da turma.
- **HU-APR-01** CA-02: O jeito em que o aluno vai melhor só é indicado com pelo menos 3 atividades naquele jeito (RN-21).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/aprendizagem.ts](../../../packages/core/src/aprendizagem.ts)
- [apps/web/lib/painel/pentagrama.ts](../../../apps/web/lib/painel/pentagrama.ts)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
