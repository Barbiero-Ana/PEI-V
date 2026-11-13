# Documentação do Modolume

Toda a documentação do projeto fica nesta pasta, separada por tipo. Os links internos usam o formato `[[nome do documento]]`, do Obsidian.

Os PRDs em `02-modulos` definem os requisitos. A [arquitetura](08-engenharia/arquitetura.md) e a
[matriz](08-engenharia/matriz.md) descrevem implementação e evidência. Os ADRs preservam o histórico das
decisões. Documentos de contexto e inventários datados devem ser lidos na versão indicada.

## Como está organizada

| Pasta | Tipo | O que contém |
| --- | --- | --- |
| `00-modelos/` | Modelos | Modelo para criar um PRD de módulo. O modelo de ADR fica em `03-decisoes/0000-modelo.md`. |
| `01-produto/` | Visão do produto | [[PRD — Modolume]]: problema, usuários, escopo geral, fases e critérios de sucesso do produto inteiro. |
| `02-modulos/` | PRDs de módulo | Um PRD para cada módulo do sistema, com requisitos, histórias de usuário e critérios de aceite. **Substituem a Especificação de Requisitos (SRS).** |
| `03-decisoes/` | ADRs | Registros de decisão de arquitetura: o **como** e o **porquê** técnico. |
| `04-ux/` | Usabilidade | Diretrizes de interface: heurísticas de Nielsen, lei de Hick e lei de Fitts aplicadas ao painel. |
| `05-referencia/` | Referência | Contexto completo do projeto e o [[Modelo de dados]] (dicionário e diagrama do banco). |
| `08-engenharia/` | Engenharia | [Arquitetura, relatório de auditoria e rastreabilidade](08-engenharia/README.md). |
| `99-arquivo/` | Arquivo | Versões substituídas. Não editar; servem só de histórico. |

## Ordem de leitura

1. [[PRD — Modolume]]: o produto e o problema.
2. Os PRDs de módulo em `02-modulos/`: o que cada parte do sistema faz.
3. Os ADRs em `03-decisoes/`: por que o sistema foi construído assim.
4. As [[Diretrizes de usabilidade do painel]], antes de mudar qualquer tela.

## Cadeia de rastreabilidade

```
PRD do produto  →  PRD de módulo  →  requisito (MOD-XXX-NNN)  →  história de usuário  →  critério de aceite  →  teste
                                           ↘ ADR (quando a decisão é técnica)
```

## PRDs de módulo

Para acompanhar a jornada completa do aluno, incluindo seu cadastro pela escola, consulte o [mapa do módulo do aluno](08-engenharia/modulo-do-aluno.md).

| PRD | Módulo | Sigla | Componente |
| --- | --- | :---: | --- |
| [[PRD-01 — Autenticação e controle de acesso]] | Acesso | AUT | App e web |
| [[PRD-02 — Administração de usuários]] | Acesso | ADM | Web |
| [[PRD-03 — Gestão de turmas]] | Acesso | TUR | Web |
| [[PRD-04 — Missões do aluno]] | Aluno | MIS | App |
| [[PRD-05 — Gamificação]] | Aluno | GAM | App |
| [[PRD-06 — Experiência do aluno]] | Aluno | ALU | App |
| [[PRD-07 — Perfil e personalização]] | Aluno | PER | App |
| [[PRD-08 — Acessibilidade]] | Aluno | ACE | App |
| [[PRD-09 — Relatório para a família]] | Aluno | REL | App |
| [[PRD-10 — Histórico e sincronização]] | Aluno | HIS | App e serviços |
| [[PRD-11 — Análise de aprendizagem]] | Professor | APR | Núcleo, app e web |
| [[PRD-12 — Painel do professor]] | Professor | PRF | Web |
| [[PRD-13 — Planejamento de aulas]] | Professor | PLA | Web |
| [[PRD-14 — Atividades do professor]] | Professor | ATI | Web e app |
| [[PRD-15 — Avaliação e feedback]] | Professor | AVA | Web e app |
| [[PRD-16 — Notificações]] | Transversal | NOT | App e web |
| [[PRD-17 — Qualidade, segurança e restrições]] | Transversal | ADF, DES, CMP, USA, CON, SEG, MAN, POR | Todos |

## Convenções

- **Identificador de requisito:** `MOD-<SIGLA>-<NNN>`, único e permanente. Os números da SRS v0.2 foram mantidos.
- **Prioridade:** **E** (essencial), **I** (importante) e **D** (desejável). A prioridade não define sozinha o que entra no MVP; quem define é o PRD.
- **Verificação:** **T** (teste), **D** (demonstração), **N** (inspeção) e **A** (análise ou medição).
- **Situação:** **Implementado** (funciona no sistema), **Parcial** (funciona com limitação, descrita no PRD), **Pendente** (ainda não existe) e **A medir** (existe, mas a meta ainda não foi medida).
- **Histórias de usuário:** `HU-<SIGLA>-NN`, no formato "Como…, quero…, para…".
- **Critérios de aceite:** `CA-NN`, no formato "Dado…, quando…, então…", sempre observáveis e testáveis. `[x]` indica critério já atendido pelo sistema atual; `[ ]`, critério ainda não atendido ou não medido.
- **Regras de negócio:** `RN-NN`, numeração única no projeto. Cada regra fica no PRD do módulo que a aplica.
- **Quando algo mudar:** primeiro o PRD de módulo, depois o código. Se a mudança for técnica e relevante, registre também um ADR.
