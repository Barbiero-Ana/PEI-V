# MOD-NOT-006

O painel mostra os alertas do dia do professor: aula hoje, plano de amanhã em rascunho, aula sem registro, atividade liberada hoje, atividade com data passada não enviada, aluno em queda e alunos que pedem atenção.

Origem: [PRD-16 — Notificações](../../02-modulos/PRD-16%20%E2%80%94%20Notifica%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-NOT-04 Como **professor**, quero ver de manhã o que precisa da minha ação hoje.

- **HU-NOT-04** CA-01: Dada uma aula hoje, então o alerta "Aula hoje às HH:MM · turma" aparece no sino.
- **HU-NOT-04** CA-02: Dada uma aula passada sem registro, então aparece o alerta "Aula sem registro".
- **HU-NOT-04** CA-03: Dado um aluno com queda no período, então aparece "Nome caiu N pontos".
- **HU-NOT-04** CA-04: Cada alerta leva à tela onde a ação é feita.
- **HU-NOT-04** CA-05: Avaliações pendentes geram alerta (NOT-005).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/web/lib/painel/alertas.ts](../../../apps/web/lib/painel/alertas.ts)
- [apps/web/components/painel/alertas.tsx](../../../apps/web/components/painel/alertas.tsx)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
