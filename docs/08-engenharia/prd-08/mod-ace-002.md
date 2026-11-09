# MOD-ACE-002

O aluno pode ativar a leitura em voz de enunciados, dicas, retornos e títulos, com opção de ouvir de novo.

Origem: [PRD-08 — Acessibilidade](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ACE-02 Como **aluno com dificuldade de leitura**, quero ouvir o enunciado e a dica, para resolver sozinho.

- **HU-ACE-02** CA-01: Com a voz ligada, enunciados, dicas, retornos e títulos são lidos em português do Brasil.
- **HU-ACE-02** CA-02: Cada fase tem o botão "Ouvir de novo".

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
