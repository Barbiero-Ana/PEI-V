# MOD-TUR-003

A administração pode atribuir uma turma no cadastro do professor. A coordenação adiciona e remove professores das turmas do seu segmento.

Origem: [PRD-03 — Gestão de turmas](../../02-modulos/PRD-03%20%E2%80%94%20Gest%C3%A3o%20de%20turmas.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-TUR-02 Como **gestão**, quero vincular professores e alunos às turmas, para que cada um veja o que é seu.

- **HU-TUR-02** CA-01: Dada uma turma, quando a gestão vincula um professor, então a turma passa a aparecer no painel desse professor.
- **HU-TUR-02** CA-02: Dado um aluno vinculado, quando a gestão remove o vínculo, então o aluno sai da lista da turma e suas jogadas continuam no histórico.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/api/src/coordenacao.ts](../../../apps/api/src/coordenacao.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/web/app/admin/turmas](../../../apps/web/app/admin/turmas)
- [apps/web/app/coordenacao/vinculos](../../../apps/web/app/coordenacao/vinculos)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
