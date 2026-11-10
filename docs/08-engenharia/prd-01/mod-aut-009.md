# MOD-AUT-009

Permitir o acesso do aluno por um código pessoal (passado pelo professor ou coordenação) e um PIN de 4 números criado no primeiro acesso, sem exigir e-mail e sem escolher nome numa lista. Códigos novos têm quatro letras e quatro números, como `BDFH-2468`, conforme o ADR 0020.

Origem: [PRD-01 — Autenticação e controle de acesso](../../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AUT-02 Como **aluno**, quero entrar no app com o meu código e um PIN só meu, para jogar na minha conta sem precisar de e-mail e sem que um colega entre no meu lugar.

- **HU-AUT-02** CA-01: Dado um código pessoal válido de um aluno sem PIN, quando ele o digita, então vê "Oi, (primeiro nome)!" e cria um PIN de 4 números, digitando duas vezes.
- **HU-AUT-02** CA-02: Dado um PIN fácil de adivinhar (todos iguais ou em sequência, como 1234), quando o aluno tenta criá-lo, então vê "Esse PIN é fácil de adivinhar. Escolha outro."
- **HU-AUT-02** CA-03: Dado um aluno com PIN, quando ele digita o código e o PIN certo, então entra direto na própria conta; com o PIN errado, vê quantas tentativas restam.
- **HU-AUT-02** CA-04: Dados 5 PINs errados seguidos, então o acesso fica bloqueado por 15 minutos, mesmo com o PIN certo.
- **HU-AUT-02** CA-05: Dado um código bem formado que não existe ou pertence a um aluno desativado, então o aluno vê "Código não encontrado. Confira com o seu professor."
- **HU-AUT-02** CA-06: Em nenhum momento o app pede e-mail nem mostra a lista de nomes da turma.
- **HU-AUT-02** CA-07: Dado um código no formato novo, quando o aluno o digita em minúsculas, com hífen, com espaço entre os grupos ou sem separador, então o app identifica a mesma conta. Um código antigo ainda não regenerado continua válido.
- **HU-AUT-02** CA-08: Dado um código incompleto ou com caracteres inválidos, então o app explica o formato e permite corrigir a entrada.
- **HU-AUT-02** CA-09: Dadas duas criações concorrentes com PINs diferentes para o mesmo aluno, a API aceita apenas uma. Cinco PINs incorretos acionam o bloqueio mesmo quando chegam em paralelo.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)
- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/web/app/entrar](../../../apps/web/app/entrar)
- [apps/web/app/redefinir-senha](../../../apps/web/app/redefinir-senha)
- [apps/mobile/src/app/entrar.tsx](../../../apps/mobile/src/app/entrar.tsx)

**Aceite nesta auditoria** Evidência parcial.

codigo-acesso.test.ts cobre formato e compatibilidade. verificar-banco.ts valida PIN inicial único e bloqueio com cinco falhas concorrentes. Homologar a digitação e a colagem no aparelho.
