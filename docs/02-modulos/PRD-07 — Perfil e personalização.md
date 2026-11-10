---
modulo: PER
prd: PRD-07
atualizado: 2026-11-05
status: para revisão
---

# PRD-07 — Perfil e personalização

## 1. Resumo executivo

O perfil é o espaço do aluno: nome, avatar montável, capa animada, constelações conquistadas e preferências (vibração, acessibilidade, apagar progresso). A personalização dá sentido às luzes ganhas e cria vínculo com o app.

## 2. Problema e oportunidade

- P3 (produto): o aluno se engaja mais quando o app "é dele".
- Preferências precisam ser fáceis de achar e de desfazer.

## 3. Usuários e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno | Se reconhecer no app | Avatar montável, capa e nome editáveis |
| Aluno | Ver o que já conquistou | Constelações de todos os mapas no perfil |
| Aluno | Controlar o aparelho | Vibração, apagar progresso com confirmação |
| Usuários da web | Trocar a senha | Alteração de senha (fase 4) |

## 4. Objetivos e critérios de sucesso

| Objetivo | Indicador | Meta | Prazo |
| --- | --- | --- | --- |
| Personalização usada | Alunos que alteram o avatar na primeira semana | 60% | 1ª semana de validação |
| Nenhuma perda acidental | Progresso apagado sem confirmação | 0 casos | Já atendido |

### 4.1 Critérios de validação

Demonstração das telas e testes de apagar progresso e de alteração de nome.

## 5. Escopo funcional

### 5.1 Requisitos

| ID | Comportamento esperado | Prior. | Verif. | Situação |
| --- | --- | :---: | :---: | :---: |
| MOD-PER-001 | O usuário visualiza seus dados principais e seu perfil de acesso. | E | D | Parcial |
| MOD-PER-002 | O aluno pode alterar nome e avatar. | E | T | Implementado |
| MOD-PER-003 | O aluno pode montar o avatar com rosto, cabelo, cores e acessórios. | I | D | Implementado |
| MOD-PER-004 | O aluno pode escolher uma capa animada para o perfil, gratuita ou comprada com luzes. | D | D | Implementado |
| MOD-PER-005 | O perfil exibe as constelações de todos os mapas e as estrelas acesas em cada uma. | I | D | Implementado |
| MOD-PER-006 | O aluno pode ligar e desligar a vibração. | I | T | Implementado |
| MOD-PER-007 | O aluno pode apagar o progresso do aparelho, mediante confirmação. | D | T | Implementado |
| MOD-PER-008 | O professor pode alterar a própria senha. O aluno não tem senha: o PIN é zerado pelo professor (MOD-AUT-009). | I | T | Pendente |

**Situação atual:** o aluno entra com o código pessoal e o PIN (PRD-01). No app, o perfil mostra nome, avatar e a turma, e tem a opção "Sair da conta"; falta a tela "Meus dados" do professor no painel (PER-001 parcial). O avatar usa a biblioteca DiceBear (estilo big-smile, licença CC BY 4.0, com crédito em Perfil → Sobre).

### Fora do escopo atual

- Foto real do aluno (por privacidade, só avatar).

## 6. Histórias de usuário

| ID | História | Requisitos |
| --- | --- | --- |
| HU-PER-01 | Como **aluno**, quero montar meu avatar e escolher meu nome, para me reconhecer no app. | PER-002, PER-003 |
| HU-PER-02 | Como **aluno**, quero escolher uma capa para o meu perfil, para deixá-lo do meu jeito. | PER-004 |
| HU-PER-03 | Como **aluno**, quero ver todas as minhas constelações no perfil, para lembrar do que conquistei. | PER-005 |
| HU-PER-04 | Como **aluno**, quero desligar a vibração e apagar meu progresso se precisar, com segurança. | PER-006, PER-007 |
| HU-PER-05 | Como **professor**, quero ver meus dados e trocar minha senha. | PER-001, PER-008 |

## 7. Critérios de aceite

Critérios marcados com [x] já são atendidos pelo app atual.

### HU-PER-01 — Avatar e nome

- [x] CA-01: Dado o editor de avatar, quando o aluno escolhe rosto, cabelo, cores e acessórios, então o avatar novo aparece no Início e no Perfil.
- [x] CA-02: Dado um nome vazio, então o botão de salvar fica indisponível até o nome ser preenchido.

### HU-PER-02 — Capa

- [x] CA-01: Capas gratuitas podem ser escolhidas direto; capas pagas exigem luzes suficientes e ficam liberadas depois da compra.

### HU-PER-03 — Constelações no perfil

- [x] CA-01: O perfil mostra a constelação de cada mapa, com as estrelas acesas.

### HU-PER-04 — Preferências seguras

- [x] CA-01: A vibração pode ser ligada e desligada, e a escolha continua ao reabrir o app.
- [x] CA-02: Dado "Apagar progresso", quando o aluno toca, então o app pede confirmação e explica que estrelas, constelações, luzes e histórico serão apagados deste aparelho.

### HU-PER-05 — Dados e senha do professor

- [ ] CA-01: Dado um professor logado, quando abre "Meus dados", então vê nome, e-mail e perfil de acesso.
- [ ] CA-02: Dada a troca de senha, o sistema pede a senha atual e confirma a nova.

## 8. MVP e fases

| Fase | Entrega | Situação |
| --- | --- | --- |
| 1 | Perfil do aluno completo. | Implementado |
| 4 | Aluno: turma no perfil e "Sair da conta". | Implementado |
| 5 | Professor: "Meus dados" e troca de senha. | Pendente |

## 9. Diretrizes do produto

- Ações que apagam dados sempre pedem confirmação e dizem o que será perdido.

## 10. Dependências e riscos

| Risco | Mitigação planejada |
| --- | --- |
| Progresso só no aparelho é perdido ao trocar de celular | Sincronização com o servidor ([[PRD-10 — Histórico e sincronização]]). |

## 11. Pendências para aprovação

- Nenhuma.

## 12. Documentos vinculados

- [[PRD — Modolume]]
- [[PRD-05 — Gamificação]] · [[PRD-08 — Acessibilidade]]
