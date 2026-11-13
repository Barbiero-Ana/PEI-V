# PRD do requisito MOD-ATI-016

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Preservar cada publicação e vincular início, resposta offline e avaliação ao conteúdo respondido, sem substituir o histórico.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-09 Como **aluno e professor**, quero preservar a versão respondida offline para manter resultados e devolutivas coerentes.

- **HU-ATI-09** CA-01: Dois envios concorrentes de uma atividade publicada retornam o mesmo identificador de publicação.
- **HU-ATI-09** CA-02: Alterar questões de uma atividade publicada é recusado; ajustar o prazo mantém o conteúdo.
- **HU-ATI-09** CA-03: Uma resposta da publicação 1 feita offline é registrada nessa versão após recolher, editar e publicar a 2.
- **HU-ATI-09** CA-04: Resposta sem versão, de outra atividade, de turma não destinatária ou com quantidade de fases incompatível é recusada e preservada no aparelho.
- **HU-ATI-09** CA-05: A entrega da publicação 1 não conclui automaticamente a publicação 2; a avaliação usa o título e a habilidade da resposta.
- **HU-ATI-09** CA-06: Arquivar preserva as publicações e permite sincronizar uma resposta offline válida.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)
- [apps/api/src/publicacoes.ts](../../../apps/api/src/publicacoes.ts)

**Aceite nesta auditoria** Evidência parcial.

verificar-publicacoes.ts cobre publicação concorrente única, imutabilidade, versão, reenvio offline, prazo, burla e arquivamento. Aceite no APK pendente.
