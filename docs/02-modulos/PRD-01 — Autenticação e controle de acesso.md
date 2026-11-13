---
modulo: AUT
prd: PRD-01
atualizado: 2026-11-10
revisao_documental: 2026-11-13
responsavel_revisao: Ana Barbiero — Líder de projeto
status: para revisão
---

# PRD-01 — Autenticação e controle de acesso

## 1. Resumo executivo

Garante que cada pessoa entre com o perfil certo e veja apenas o que lhe cabe: o aluno pelo aplicativo, com um código pessoal e um PIN de 4 números, sem e-mail; professor, gestão e administrador pela web, com e-mail e senha. É a base de confiança do Modolume, que trata dados de menores de idade.

## 2. Problema e oportunidade

- P6 (produto): os indicadores só têm valor se cada dado estiver ligado ao aluno e à turma certos.
- Crianças do Ensino Fundamental muitas vezes não têm e-mail próprio; exigir e-mail impede o acesso.
- Dados de menores exigem que cada perfil acesse somente o necessário (LGPD e ECA).

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Entrar na própria conta sem e-mail e sem senha difícil | Código pessoal + PIN de 4 números (MOD-AUT-009, ADR 0017) |
| Professor | Entrar rápido e ver só as suas turmas | E-mail e senha na web, com sessão de 8 horas |
| Gestão e administrador | Acessar as funções do seu perfil | Perfis com permissões verificadas no servidor |
| Escola | Proteger os dados dos alunos | Controle de acesso por perfil e por vínculo |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Acesso do aluno sem barreiras | Alunos que entram no app com o código pessoal e criam o PIN sem ajuda | 90% | Sessão de validação |
| Acesso seguro | Tentativas de acesso a dados de outra turma bloqueadas nos testes | 100% | Antes da validação (fase 4) |
| Login rápido do professor | Tempo do login até a visão geral | Até 30 segundos | Teste de tarefa na validação |

### 4.1 Critérios de validação

Testes funcionais de cada perfil (acesso permitido e negado), teste de expiração de sessão e sessão de uso com alunos para o acesso por código.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-AUT-001 | Permitir que usuários cadastrados se autentiquem com suas credenciais. | E | T | Implementado |
| MOD-AUT-002 | Identificar o perfil do usuário após a autenticação. | E | T | Implementado |
| MOD-AUT-003 | Disponibilizar o acesso do aluno pelo aplicativo móvel e dos perfis professor, gestão e administrador pela plataforma web, respeitando suas permissões. | E | T | Implementado |
| MOD-AUT-004 | Restringir telas, funções e operações conforme o perfil autenticado. | E | T | Implementado |
| MOD-AUT-005 | Permitir que o usuário encerre sua sessão. | E | T | Implementado |
| MOD-AUT-006 | Manter a sessão ativa entre aberturas do aplicativo enquanto a autenticação for válida. | E | T | Implementado |
| MOD-AUT-007 | Permitir a redefinição de senha por e-mail para professor, gestão e administrador. | I | T | Parcial |
| MOD-AUT-008 | Permitir que o professor redefina o acesso de um aluno (zerar o PIN ou gerar novo código). | I | T | Implementado |
| MOD-AUT-009 | Permitir o acesso do aluno por um código pessoal (passado pelo professor ou coordenação) e um PIN de 4 números criado no primeiro acesso, sem exigir e-mail e sem escolher nome numa lista. Códigos novos têm quatro letras e quatro números, como `BDFH-2468`, conforme o ADR 0020. | E | T | Implementado |

**Situação atual, em detalhe**

- **API (ADR 0015):** o professor entra com e-mail e senha (guardada com bcrypt) e recebe um token de 8 horas; o aluno entra com o código pessoal e o PIN, sem e-mail, e recebe um token de 180 dias (ADR 0017). O PIN fica só como hash; 5 PINs errados seguidos bloqueiam o acesso por 15 minutos; um código novo invalida as sessões antigas do aluno. Toda rota confere o papel (professor ou aluno) e o vínculo com a turma no servidor.
- **Painel (web):** a entrada é comum a administrador, coordenação e professor. O token fica no cookie de sessão (`httpOnly`, 8 horas). Token recusado leva de volta à tela de entrada.
- **App:** a entrada na turma usa código e PIN. Quem não tem código pode tocar em **Experimentar demonstração** e usar as missões com progresso local separado. O Perfil oferece a entrada na turma e a saída da sessão escolar.
- **Definição e recuperação de senha:** a equipe solicita o link em **Recuperar acesso**. A API usa Resend,
  resumo do token, uso único e prazo configurável de 30 minutos. Os testes cobrem o contrato de envio simulado.
  A entrega real e o percurso pelo e-mail aguardam homologação.

### 5.2 Regras de negócio

| Regra | Síntese |
| --- | --- |
| RN-14 | A mensagem de login inválido é a mesma para e-mail inexistente e senha errada, para não revelar quais e-mails existem. |
| RN-15 | A sessão da web expira em 8 horas; depois disso, o usuário volta à tela de entrada. |

### Fora do escopo atual

- Login com contas Google ou Microsoft.
- Autenticação em dois fatores.
- Cadastro do próprio aluno sem vínculo com uma turma.

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-AUT-01 | Como **professor**, quero entrar no painel com meu e-mail e senha, para acompanhar minhas turmas. | AUT-001, AUT-002, AUT-003 |
| HU-AUT-02 | Como **aluno**, quero entrar no app com o meu código e um PIN só meu, para jogar na minha conta sem precisar de e-mail e sem que um colega entre no meu lugar. | AUT-009, AUT-003 |
| HU-AUT-03 | Como **escola**, quero que cada perfil veja só o que lhe cabe, para proteger os dados dos alunos. | AUT-004 |
| HU-AUT-04 | Como **usuário**, quero sair da minha conta, para que outra pessoa não use meu acesso no mesmo aparelho. | AUT-005 |
| HU-AUT-05 | Como **aluno**, quero continuar conectado ao reabrir o app, para não digitar o código toda vez. | AUT-006 |
| HU-AUT-06 | Como **professor**, quero redefinir minha senha pelo e-mail, para não perder o acesso se eu esquecer. | AUT-007 |
| HU-AUT-07 | Como **professor**, quero redefinir o acesso de um aluno, para que ele volte a entrar se trocar de aparelho. | AUT-008 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo sistema atual (com dados de demonstração).

### HU-AUT-01 — Professor entra no painel

- [x] CA-01: Dado um professor cadastrado, quando ele informa e-mail e senha corretos, então vê a Visão geral com o próprio nome no topo.
- [x] CA-02: Dado um e-mail inexistente ou uma senha errada, quando o professor tenta entrar, então vê "E-mail ou senha incorretos." e continua na tela de entrada (RN-14).
- [x] CA-03: Dado um campo vazio, quando o professor tenta entrar, então vê "Preencha o e-mail e a senha." e nada é gravado.
- [x] CA-04: Dado um usuário sem sessão, quando ele abre qualquer endereço de `/professor`, então é levado à tela de entrada.

### HU-AUT-02 — Aluno entra com o código pessoal e o PIN

- [x] CA-01: Dado um código pessoal válido de um aluno sem PIN, quando ele o digita, então vê "Oi, (primeiro nome)!" e cria um PIN de 4 números, digitando duas vezes.
- [x] CA-02: Dado um PIN fácil de adivinhar (todos iguais ou em sequência, como 1234), quando o aluno tenta criá-lo, então vê "Esse PIN é fácil de adivinhar. Escolha outro."
- [x] CA-03: Dado um aluno com PIN, quando ele digita o código e o PIN certo, então entra direto na própria conta; com o PIN errado, vê quantas tentativas restam.
- [x] CA-04: Dados 5 PINs errados seguidos, então o acesso fica bloqueado por 15 minutos, mesmo com o PIN certo.
- [x] CA-05: Dado um código bem formado que não existe ou pertence a um aluno desativado, então o aluno vê "Código não encontrado. Confira com o seu professor."
- [x] CA-06: Em nenhum momento o app pede e-mail nem mostra a lista de nomes da turma.
- [ ] CA-07: Dado um código no formato novo, quando o aluno o digita em minúsculas, com hífen, com espaço entre os grupos ou sem separador, então o app identifica a mesma conta. Um código antigo ainda não regenerado continua válido.
- [ ] CA-08: Dado um código incompleto ou com caracteres inválidos, então o app explica o formato e permite corrigir a entrada.
- [x] CA-09: Dadas duas criações concorrentes com PINs diferentes para o mesmo aluno, a API aceita apenas uma. Cinco PINs incorretos acionam o bloqueio mesmo quando chegam em paralelo.

### HU-AUT-03 — Cada perfil vê só o que lhe cabe

- [x] CA-01: Dado um professor logado, quando ele abre o endereço de uma turma de outro professor, então vê "página não encontrada" e nenhum dado dessa turma.
- [x] CA-02: Dado um aluno, quando o app busca dados no servidor, então recebe apenas os dados da própria turma e os seus.
- [x] CA-03: Toda permissão é verificada no servidor, e não só escondida na tela (MOD-SEG-003); um aluno que chama uma rota de professor recebe "Você não tem permissão para isso."

### HU-AUT-04 — Sair da conta

- [x] CA-01: Dado um professor logado, quando ele aciona "Sair do painel", então a sessão é apagada e ele volta à tela de entrada.
- [ ] CA-02: Depois de sair, ao usar o botão voltar do navegador, o painel não mostra dados sem um novo login.

### HU-AUT-05 — Continuar conectado

- [x] CA-01: Dado um aluno que entrou com o código, quando ele fecha e reabre o app, então volta direto ao Início.
- [x] CA-02: Dado um professor com sessão de mais de 8 horas, quando ele navega no painel, então é levado à tela de entrada (RN-15).

### HU-AUT-06 — Redefinir a senha

- [ ] CA-01: Dado um e-mail cadastrado, quando o professor pede a redefinição, então recebe um link de uso único com validade limitada.
- [x] CA-02: A tela mostra a mesma mensagem para e-mails cadastrados ou não.

### HU-AUT-07 — Redefinir o acesso de um aluno

- [x] CA-01: Dado um aluno da turma, quando o professor abre o perfil dele no painel, então vê o código de acesso (com "Copiar") e se o PIN já foi criado ou está bloqueado.
- [x] CA-02: Dado um aluno que esqueceu o PIN, quando o professor confirma "Zerar PIN", então o aluno cria um PIN novo no próximo acesso, com o mesmo código, e o progresso salvo é mantido.
- [x] CA-03: Dado um código vazado ou um celular perdido, quando o professor confirma "Novo código", então o código antigo deixa de funcionar e o aluno sai do app em todos os aparelhos.
- [x] CA-04: O professor só zera o PIN ou gera código de alunos das próprias turmas; para outro aluno, a API responde "Aluno não encontrado."
- [ ] CA-05: Ao cadastrar um aluno ou gerar um novo código, o painel mostra e copia quatro letras, um hífen e quatro números, conforme o [ADR 0020](../03-decisoes/0020-codigo-do-aluno-com-letras-e-numeros.md).

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 3 | Login de demonstração do professor, sessão de 8 horas, páginas protegidas e recorte de dados por professor. | Implementado |
| 4 | Login real pela API (senha em hash) e acesso do aluno por código pessoal + PIN, com redefinição pelo professor. | Implementado |
| 5 | Papéis coordenação e administrador, cada um com a sua área (ADR 0019); senha provisória com troca obrigatória; mudança de papel ou desativação encerram a sessão na hora. | Implementado |
| 5 | Definição e redefinição por link privado. Implementação disponível, entrega real aguardando homologação. | Parcial |

## 9. Diretrizes do produto

- O aluno nunca precisa de e-mail.
- Mensagens de erro de acesso são claras, mas não revelam quais contas existem.
- Toda restrição de acesso existe no servidor; esconder um botão não é controle de acesso.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Senha de demonstração usada fora da validação | Trocar pelo login da API na fase 4; senha de demonstração só por variável de ambiente. |
| Aluno entrar na conta de um colega | Não há lista de nomes: cada código abre só uma conta, e o PIN (só em hash) protege mesmo se o código vazar; bloqueio após 5 erros. |
| Segredo da sessão exposto | Segredo definido por ambiente; o servidor recusa iniciar em produção sem ele. |

## 11. Pendências para aprovação

- Definir quem da coordenação terá acesso ao painel para consultar os códigos (hoje, o professor da turma).
- Homologar o prazo padrão de 30 minutos e a entrega real do link pelo Resend.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-02 — Administração de usuários]] · [[PRD-03 — Gestão de turmas]] · [[PRD-17 — Qualidade, segurança e restrições]]
- [[0007-back-end-node-postgresql-railway|ADR 0007]] · [[0009-painel-construido-por-etapas|ADR 0009]]

## 13. Controle da revisão documental

A data `atualizado` do histórico foi preservada. A revisão documental de **13/11/2026** foi aprovada por
**Ana Barbiero — Líder de projeto**, para organização, consistência e rastreabilidade. Essa aprovação não
substitui o aceite funcional: cenários sem evidência ou dependentes de validação pedagógica, institucional
e de aparelhos continuam pendentes na matriz de engenharia. Não foi inferida uma data de criação.
