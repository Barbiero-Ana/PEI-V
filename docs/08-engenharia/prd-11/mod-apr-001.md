# MOD-APR-001

Associar cada missão a um formato de atividade e a um ou mais conteúdos.

Origem: [PRD-11 — Análise de aprendizagem](../../02-modulos/PRD-11%20%E2%80%94%20An%C3%A1lise%20de%20aprendizagem.md), seção 5. Prioridade **E**, método **N**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-APR-06 Como **equipe**, quero que o cálculo seja o mesmo no app e no painel, para não haver números diferentes para o mesmo aluno.

- **HU-APR-06** CA-01: Dadas 10 jogadas com 80% de acerto de primeira, 100% de autonomia e precisão máxima, então o domínio é calculado pela RN-07 no núcleo, usado pelo app e pelo painel.
- **HU-APR-06** CA-02: Dada uma nova jogada sincronizada, então o pentagrama do painel se atualiza na próxima consulta (fase 4).
- **HU-APR-06** CA-03: O painel usa o domínio (RN-07), e não só o acerto médio, quando receber jogadas reais (fase 4).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/aprendizagem.ts](../../../packages/core/src/aprendizagem.ts)
- [apps/web/lib/painel/pentagrama.ts](../../../apps/web/lib/painel/pentagrama.ts)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
