# MOD-AUT-007

Permitir a redefinição de senha por e-mail para professor, gestão e administrador.

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-06 Como **professor**, quero redefinir minha senha pelo e-mail, para não perder o acesso se eu esquecer.

- **HU-AUT-06** CA-01: Dado um e-mail cadastrado, quando o professor pede a redefinição, então recebe um link de uso único com validade limitada.
- **HU-AUT-06** CA-02: A tela mostra a mesma mensagem para e-mails cadastrados ou não.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Evidência parcial.

Uso único concorrente, expiração, resposta uniforme e contrato Resend simulado em verificar-banco.ts. Entrega real e análise do tempo de resposta pendentes.
