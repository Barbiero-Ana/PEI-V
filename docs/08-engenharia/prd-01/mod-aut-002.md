# MOD-AUT-002

Identificar o perfil do usuário após a autenticação.

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-01 Como **professor**, quero entrar no painel com meu e-mail e senha, para acompanhar minhas turmas.

- **HU-AUT-01** CA-01: Dado um professor cadastrado, quando ele informa e-mail e senha corretos, então vê a Visão geral com o próprio nome no topo.
- **HU-AUT-01** CA-02: Dado um e-mail inexistente ou uma senha errada, quando o professor tenta entrar, então vê "E-mail ou senha incorretos." e continua na tela de entrada (RN-14).
- **HU-AUT-01** CA-03: Dado um campo vazio, quando o professor tenta entrar, então vê "Preencha o e-mail e a senha." e nada é gravado.
- **HU-AUT-01** CA-04: Dado um usuário sem sessão, quando ele abre qualquer endereço de `/professor`, então é levado à tela de entrada.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
