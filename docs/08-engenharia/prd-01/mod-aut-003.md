# MOD-AUT-003

Disponibilizar o acesso do aluno pelo aplicativo móvel e dos perfis professor, gestão e administrador pela plataforma web, respeitando suas permissões.

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-01 Como **professor**, quero entrar no painel com meu e-mail e senha, para acompanhar minhas turmas.
- HU-AUT-02 Como **aluno**, quero entrar no app com o meu código e um PIN só meu, para jogar na minha conta sem precisar de e-mail e sem que um colega entre no meu lugar.

- **HU-AUT-01** CA-01: Dado um professor cadastrado, quando ele informa e-mail e senha corretos, então vê a Visão geral com o próprio nome no topo.
- **HU-AUT-01** CA-02: Dado um e-mail inexistente ou uma senha errada, quando o professor tenta entrar, então vê "E-mail ou senha incorretos." e continua na tela de entrada (RN-14).
- **HU-AUT-01** CA-03: Dado um campo vazio, quando o professor tenta entrar, então vê "Preencha o e-mail e a senha." e nada é gravado.
- **HU-AUT-01** CA-04: Dado um usuário sem sessão, quando ele abre qualquer endereço de `/professor`, então é levado à tela de entrada.
- **HU-AUT-02** CA-01: Dado um código pessoal válido de um aluno sem PIN, quando ele o digita, então vê "Oi, (primeiro nome)!" e cria um PIN de 4 números, digitando duas vezes.
- **HU-AUT-02** CA-02: Dado um PIN fácil de adivinhar (todos iguais ou em sequência, como 1234), quando o aluno tenta criá-lo, então vê "Esse PIN é fácil de adivinhar. Escolha outro."
- **HU-AUT-02** CA-03: Dado um aluno com PIN, quando ele digita o código e o PIN certo, então entra direto na própria conta; com o PIN errado, vê quantas tentativas restam.
- **HU-AUT-02** CA-04: Dados 5 PINs errados seguidos, então o acesso fica bloqueado por 15 minutos, mesmo com o PIN certo.
- **HU-AUT-02** CA-05: Dado um código bem formado que não existe ou pertence a um aluno desativado, então o aluno vê "Código não encontrado. Confira com o seu professor."
- **HU-AUT-02** CA-06: Em nenhum momento o app pede e-mail nem mostra a lista de nomes da turma.
- **HU-AUT-02** CA-07: Dado um código no formato novo, quando o aluno o digita em minúsculas, com hífen, com espaço entre os grupos ou sem separador, então o app identifica a mesma conta. Um código antigo ainda não regenerado continua válido.
- **HU-AUT-02** CA-08: Dado um código incompleto ou com caracteres inválidos, então o app explica o formato e permite corrigir a entrada.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
