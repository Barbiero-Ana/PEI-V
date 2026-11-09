# ADR 0020 — Quatro letras e quatro números no código do aluno

- **Status:** Aceita
- **Data:** 09/11/2026
- **Decisores:** responsável pelo projeto
- **Uso de IA:** implementação e verificação da alteração solicitada pelo responsável.

## Contexto

O ADR 0017 estabeleceu código pessoal e PIN. Como cada posição do código podia misturar letras e números, ler, copiar ou ditar a credencial exigia atenção a cada caractere.

## Decisão

Todo código pessoal novo, inclusive em cadastro e regeneração, tem quatro letras seguidas de quatro números. A interface apresenta os grupos com hífen, por exemplo `BDFH-2468`. As letras I, L e O e os dígitos 0 e 1 continuam fora do alfabeto para evitar confusão visual. O aplicativo e a API aceitam o código com hífen, com espaço entre os grupos ou sem separador, e tratam maiúsculas e minúsculas da mesma forma.

O banco continua guardando oito caracteres sem separador. Códigos antigos continuam válidos enquanto não forem regenerados. O PIN e as regras de revogação do ADR 0017 continuam em vigor.

## Alternativas consideradas

- **Apenas acrescentar hífen.** A interface já separava os grupos visualmente, mas cada grupo continuaria misturando letras e números.
- **Trocar todos os códigos existentes.** Isso exigiria redistribuir credenciais e invalidaria sessões de alunos que já usam o sistema.

## Consequências

- O professor pode ditar primeiro as quatro letras e depois os quatro números. O mesmo formatador apresenta o código no app e nos painéis.
- Com 23 letras e 8 dígitos, há cerca de 1,15 bilhão de combinações. A restrição de unicidade, o PIN e os limites de tentativas continuam necessários.
- O formato novo cabe na coluna e na restrição existentes. A mudança entra na geração de códigos e dispensa uma migração de dados.
- O formato convive com códigos antigos durante a transição. As telas de acesso explicam o novo padrão, e a API continua aceitando credenciais anteriores.

Relacionados: [ADR 0017](0017-acesso-individual-do-aluno.md) e [PRD-01](../02-modulos/PRD-01%20%E2%80%94%20Autentica%C3%A7%C3%A3o%20e%20controle%20de%20acesso.md), requisitos MOD-AUT-008 e MOD-AUT-009.
