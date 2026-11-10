# ADR 0014 — Documentação por PRD de módulo, no lugar da SRS

- **Status:** Aceita
- **Data:** 04/11/2026
- **Decisores:** a preencher pela equipe, conforme orientação do professor orientador
- **Uso de IA:** auxílio na divisão dos requisitos por módulo, na redação das histórias de usuário e dos critérios de
  aceite e na conferência de cada requisito com o código. A estrutura do PRD foi definida pela equipe.

## Contexto

A documentação tinha um PRD do produto e uma Especificação de Requisitos (SRS, ISO/IEC/IEEE 29148) com todos os
requisitos juntos. O professor orientador pediu que cada módulo do sistema fosse um PRD, com histórias de usuário e
critérios de aceite, para que a SRS deixasse de ser necessária. A pasta `docs` também misturava tipos de documento.

## Decisão

- Cada módulo vira um PRD em `docs/02-modulos/`, com a mesma estrutura do PRD do produto e mais três partes: a tabela
  de requisitos (com a situação de cada um no sistema), as histórias de usuário e os critérios de aceite no formato
  "Dado…, quando…, então…".
- Os identificadores `MOD-XXX-NNN` e as regras `RN-NN` da SRS v0.2 foram mantidos. Requisitos que já existiam no
  sistema e não estavam na SRS ganharam números novos (por exemplo, `MOD-PLA` e `MOD-PRF-008` em diante).
- Os requisitos não funcionais, as interfaces, as restrições e a matriz de permissões ficam no PRD-17 (transversal).
- A pasta `docs` é separada por tipo: modelos, produto, módulos, decisões (ADR), UX, referência e arquivo.
- A SRS e os rascunhos antigos vão para `docs/99-arquivo/`, sem novas edições.

## Alternativas consideradas

- **Manter a SRS ao lado dos PRDs:** duplicaria cada requisito em dois lugares, com risco de divergência.
- **Um PRD por funcionalidade pequena:** geraria dezenas de documentos; o módulo é a unidade que a equipe já usa.

## Consequências

- **Positivas:** cada módulo tem, num só lugar, o porquê, o quê, as histórias e como verificar; a coluna "Situação" e os
  critérios marcados mostram o que o sistema já faz.
- **Negativas:** requisitos transversais ficam num PRD à parte e precisam ser consultados junto com os módulos.
- **O que fica pendente:** manter a coluna "Situação" atualizada a cada entrega e revisar os PRDs com a equipe.
