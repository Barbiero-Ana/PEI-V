# Registros de decisão de arquitetura (ADR)

Cada arquivo desta pasta registra **uma** decisão importante do Modolume: o contexto, o que foi decidido, as
alternativas consideradas e as consequências. Juntos, contam como o projeto chegou à forma atual.

## Decisões

| Nº | Decisão | Status | Data |
| --- | --- | --- | --- |
| [0001](0001-monorepo-com-nucleo-compartilhado.md) | Monorepo com núcleo de regras compartilhado | Aceita | 06/10/2026 |
| [0002](0002-react-native-com-expo.md) | App do aluno em React Native com Expo | Aceita | 07/10/2026 |
| [0003](0003-progresso-local-e-uso-sem-conexao.md) | Progresso salvo no aparelho e uso sem conexão | Aceita | 07/10/2026 |
| [0004](0004-ultima-estrela-so-com-o-mapa-completo.md) | Última estrela da constelação só com o mapa completo | Aceita | 09/10/2026 |
| [0005](0005-alto-contraste-sem-reiniciar.md) | Alto contraste aplicado sem reiniciar o app | Aceita | 09/10/2026 |
| [0006](0006-analise-de-aprendizagem-por-dominio.md) | Análise de aprendizagem pelo domínio de cada formato | Aceita | 13/10/2026 |
| [0007](0007-back-end-node-postgresql-railway.md) | Back-end em Node.js com PostgreSQL no Railway | Aceita | 14/10/2026 |
| [0008](0008-painel-do-professor-em-nextjs.md) | Painel do professor em Next.js com TypeScript | Aceita | 27/10/2026 |
| [0009](0009-painel-construido-por-etapas.md) | Painel do professor construído por etapas | Aceita | 27/10/2026 |
| [0010](0010-planejamento-de-aulas-no-painel.md) | Planejamento de aulas no painel do professor | Aceita | 27/10/2026 |
| [0011](0011-atividades-montadas-pelo-professor.md) | Atividades montadas pelo professor e enviadas ao app | Aceita | 28/10/2026 |
| [0012](0012-indicadores-smart-no-painel.md) | Indicadores SMART no painel do professor | Aceita | 04/11/2026 |
| [0013](0013-navegacao-do-painel-com-nomes-visiveis.md) | Navegação do painel com nomes visíveis e agrupados | Aceita | 04/11/2026 |
| [0014](0014-documentacao-por-prd-de-modulo.md) | Documentação por PRD de módulo, no lugar da SRS | Aceita | 04/11/2026 |
| [0015](0015-integracao-app-painel-pela-api.md) | Integração do app com o painel pela API | Aceita | 04/11/2026 |
| [0016](0016-modelo-relacional-do-banco.md) | Modelo relacional do banco | Aceita | 04/11/2026 |
| [0017](0017-acesso-individual-do-aluno.md) | Acesso individual do aluno: código pessoal e PIN | Aceita | 05/11/2026 |
| [0018](0018-site-com-planos-e-app-so-no-celular.md) | Site com planos e app só no celular | Aceita | 05/11/2026 |
| [0019](0019-papeis-coordenacao-e-administrador.md) | Papéis da equipe: professor, coordenação e administrador | Aceita | 05/11/2026 |
| [0020](0020-codigo-do-aluno-com-letras-e-numeros.md) | Quatro letras e quatro números no código do aluno | Aceita | 09/11/2026 |

Os ADRs dizem **como** e **por que** o sistema foi construído assim. O **que** o sistema faz está nos PRDs de módulo
(`docs/02-modulos/`).

## Como usar

1. **Uma decisão nova** ganha um ADR antes de ser implementada: copie o [modelo](0000-modelo.md), use o próximo
   número e um nome curto (`0010-nome-da-decisao.md`).
2. **Status:** `Proposta` (em discussão) → `Aceita` (decidida) → `Substituída por ADR NNNN` (quando uma decisão
   nova a troca).
3. **Um ADR aceito não é reescrito.** Se a decisão mudar, crie um novo ADR que a substitui e atualize o status
   do antigo. Assim o histórico fica preservado.
4. **Decisores:** preencha com os nomes de quem participou da decisão.
5. **Uso de IA:** registre se a IA foi usada e para quê (por exemplo, levantar alternativas ou auxiliar no
   código). A decisão é sempre da equipe.
6. Atualize a tabela acima.
