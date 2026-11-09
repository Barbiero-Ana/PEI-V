# MOD-PER-006

O aluno pode ligar e desligar a vibração.

Origem: [PRD-07 — Perfil e personalização](../../02-modulos/PRD-07%20%E2%80%94%20Perfil%20e%20personaliza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PER-04 Como **aluno**, quero desligar a vibração e apagar meu progresso se precisar, com segurança.

- **HU-PER-04** CA-01: A vibração pode ser ligada e desligada, e a escolha continua ao reabrir o app.
- **HU-PER-04** CA-02: Dado "Apagar progresso", quando o aluno toca, então o app pede confirmação e explica que estrelas, constelações, luzes e histórico serão apagados deste aparelho.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/(abas)/perfil.tsx](../../../apps/mobile/src/app/(abas)/perfil.tsx)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/web/app/conta/senha](../../../apps/web/app/conta/senha)
- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
