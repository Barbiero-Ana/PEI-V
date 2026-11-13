# Modolume — Contexto completo do projeto

> Documento de contexto para quem vai ajudar na documentação (pessoa ou IA). Reúne o que é o projeto, o problema, a solução, o estado atual, as decisões já tomadas e o que ainda está em aberto. Atualizado em 04/11/2026.

> **Referência histórica de 04/11/2026.** Os trechos de tecnologia e acesso descrevem aquela versão.
> Para o estado vigente, consulte a [arquitetura](../08-engenharia/arquitetura.md), os PRDs de módulo e a
> [matriz de rastreabilidade](../08-engenharia/matriz.md).

---

## 1. Identificação

| Item | Descrição |
|---|---|
| Nome | **Modolume** (nome anterior: Questly; o repositório ainda se chama `Questly`) |
| Slogans | "Ideias que se iluminam" · "Aprender tem muitos modos" |
| Tipo | Projeto Extensionista Integrador IV |
| Instituição | Centro Universitário de Várzea Grande — UNIVAG (Várzea Grande — MT), 2026 |
| Professor orientador | Brendo Yuri Maia do Vale |
| Equipe | Ana Carolina da S. Barbiero, Túlio F. Q. Dantas, João Vitor dos Reis Leme Franco, Guilherme Soares Nistal Sanches, Yuri Zambrana A. de Magalhães |
| Escola de validação | "Escola parceira" (no código e nos dados de exemplo: "Escola Demonstração"). **Não citar o nome de nenhuma escola real.** |

---

## 2. A ideia em uma frase

O Modolume é uma **ponte entre aluno e professor**: o aluno pratica Matemática no celular com minijogos em formatos diferentes, e o professor recebe na web um **perfil de como cada aluno aprende**, para reestruturar aulas e provas de forma objetiva e atender quem tem dificuldade.

**Posicionamento importante:** o Modolume **não é só um app para praticar Matemática**. A gamificação é o meio; o objetivo é dar ao professor informação pedagógica. A Matemática do Ensino Fundamental é só o conteúdo inicial.

---

## 3. O problema

### 3.1 Contexto

- A avaliação de Matemática no Ensino Fundamental costuma usar um único formato: a prova escrita.
- Quando o aluno vai mal, o professor sabe *que* ele teve dificuldade, mas não *por quê*: se não entendeu o conteúdo ou se o formato da atividade não favorece seu jeito de aprender.
- Há alunos que entendem melhor manipulando objetos, montando, ordenando ou vendo em 3D. Perceber isso exige observação individual, o que é inviável em turmas de 30 a 40 alunos.

### 3.2 Problemas que o projeto ataca

| Nº | Problema | Afetado |
|---|---|---|
| P1 | O professor não tem informação objetiva sobre os formatos de atividade em que cada aluno compreende melhor ou pior. | Professor |
| P2 | Provas e planos de aula são montados sem dados da turma; a dificuldade só aparece depois da nota. | Professor e aluno |
| P3 | O aluno com dificuldade perde a motivação diante de atividades repetitivas e de erros que "custam pontos". | Aluno |
| P4 | Alunos com baixa visão, dislexia ou dificuldade de leitura enfrentam barreiras em atividades baseadas em texto. | Aluno |
| P5 | A família vê pouco do que o aluno pratica fora da prova. | Família |

### 3.3 O que o projeto evita de propósito

- Rotular o aluno com um "estilo de aprendizagem" fixo. A indicação muda com as jogadas e só aparece com dados suficientes.
- Ranking entre alunos.
- Punir o erro ou o pedido de dica.
- Substituir o professor ou a nota oficial.

---

## 4. A solução

### 4.1 Dois produtos e um núcleo

| Componente | Público | Plataforma | Situação |
|---|---|---|---|
| **App do aluno** | Aluno | Android e iOS (React Native + Expo) | Principal, já bem avançado |
| **Painel do professor** | Professor (e futuramente gestão e administrador) | Web (Next.js), rotas em `/professor` | Em construção por etapas, ainda com dados de demonstração |
| **Núcleo compartilhado** (`packages/core`) | — | TypeScript | Regras de missões, pontos, constelações e análise de aprendizagem, usadas pelos dois |
| **API / back-end** | — | Node.js + NestJS + Prisma + PostgreSQL no Railway | Proposta (ADR 0007), ainda não implementada |

### 4.2 O ciclo do produto

1. **O aluno joga** missões no app, em formatos diferentes, mesmo sem internet.
2. **O sistema mede** em cada jogada: formato, fases, acertos de primeira, tentativas, tempo e dicas.
3. **O professor compreende**: o painel mostra o perfil por aluno e por turma (radar ou "pentagrama" de habilidades, alunos que pedem atenção).
4. **O professor age**: planeja a aula e monta atividades no formato certo para o aluno ou o grupo.
5. **O aluno recebe** a atividade no app, e o ciclo recomeça.

### 4.3 Formatos de atividade (base de toda a análise)

| Formato (id no código) | Exemplo |
|---|---|
| Associação visual (`associacao-visual`) | Ligar pares, montar gráfico de votação, caça ao tesouro |
| Montagem (`montagem`) | Montar torre, cerca da horta, máquina misteriosa |
| Sequência (`sequencia`) | Trilha numérica, rota do entregador, ordem das operações |
| Completar lacunas (`completar`) | Jarra medidora, partes do todo, pizza equivalente, promoção |
| Manipulação (`manipulacao`) | Pagar com notas e moedas, girar ponteiros do relógio, balança, reta numérica, termômetro |
| Exploração 3D (`exploracao-3d`) | Construtor de cubos, sólidos, planificação do dado com dobra 3D, volume |
| Questão objetiva (`objetiva`) | Alternativas; usada nas atividades criadas pelo professor |

Regras de conteúdo: **toda fase parte de uma situação do cotidiano** (mercado, cozinha, horta, loja) e é resolvida por **manipulação direta** (arrastar, ligar, montar, girar, encher). A equipe rejeitou o formato "só apertar a resposta certa". Toda fase tem a **lâmpada de dica** no canto.

### 4.4 Conteúdo atual: 8 mapas e 28 missões

Cada **mapa** equivale a um nível e monta uma **constelação real**. A complexidade é crescente, do reconhecimento de quantidades até probabilidade, média e ordem das operações (alinhado à BNCC).

| Mapa | Constelação | Missões |
|---|---|---|
| 1 · Primeiros passos | Órion | Ligue os pares, Trilha numérica, Monte a torre, Mercadinho |
| 2 · No dia a dia | Escorpião | Que horas são?, Jarra medidora, Partes do todo, Votação da turma |
| 3 · Pensar e equilibrar | Cruzeiro do Sul | Reta numérica, Balança equilibrada, Caminho do entregador |
| 4 · Espaço e formas | Cassiopeia | Construtor de cubos, Explorador de sólidos, Espelho mágico (simetria) |
| 5 · Construir no espaço | Plêiades | Planificação do dado, Cubinhos escondidos (volume), Ficha dos sólidos (arestas/Euler) |
| 6 · Desafios de mestre | Cão Maior | Dividir em partes iguais (divisão com resto), Cerca da horta (área/perímetro), Gire na medida (ângulos) |
| 7 · Além dos números | Lira | Termômetro maluco (negativos), Pizza equivalente (frações), Promoção da loja (porcentagem), Caça ao tesouro (plano cartesiano) |
| 8 · Mestre dos números | Águia | Máquina misteriosa (funções), Sorteio justo (probabilidade), Nivelando as torres (média), Calculadora maluca (ordem das operações) |

### 4.5 Gamificação: "o céu que se ilumina"

- **Pontos de luz** por missão = nº de fases + nº de acertos de primeira + 3.
- **Estrelas da missão:** 3 com acerto de primeira ≥ 90%; 2 com ≥ 60%; 1 nos demais casos.
- **Constelação:** a cada 5 pontos de luz no mapa, uma estrela acende, até a penúltima. A **última só acende com todas as missões do mapa concluídas** (ADR 0004). Completa, vai para o **álbum "Meu céu"**, com animação de "viagem de câmera" e curiosidades de cada estrela (nome, meses de visibilidade no céu do Brasil).
- **Desafio do dia:** missão sorteada pela data, a mesma para todos, com pontos em dobro uma vez por dia. No futuro, o professor poderá definir.
- **Dias de luz:** calendário dos dias jogados, **sem punição** por dias sem jogar.
- **Conquistas** por marcos, mostrando quanto falta.
- **Mascote:** **Lilo, o axolote curioso** (lilás, com guelras rosa, pêssego e azul). Reage a acerto, erro, dica e comemoração, e evolui conforme as estrelas acesas: Filhote → Curioso → Explorador → Lilo Estelar.
- **Luzes e loja:** luzes = pontos ganhos − gastos; trocáveis por acessórios do avatar e capas animadas do perfil. Compras são permanentes.
- **Avatar** montável (DiceBear big-smile, licença CC BY 4.0, com crédito no app).
- **Sem ranking.** Erro e dica não tiram pontos.
- Na fase de validação, todos os mapas ficam liberados (opção "Liberar todos os níveis").

### 4.6 Análise de aprendizagem (o coração do projeto, ADR 0006)

Para **cada formato**, considerando as **10 jogadas mais recentes**:

- **Acerto de primeira:** fases resolvidas sem errar (as jogadas recentes pesam mais).
- **Autonomia:** fases resolvidas sem pedir dica.
- **Precisão:** baseada no número de tentativas por fase.
- **Domínio (0 a 100)** = 65% acerto de primeira + 20% autonomia + 15% precisão.
- **Nível:** ≥ 75 "vai muito bem"; 50 a 74 "está crescendo"; < 50 "vale treinar".
- **Tendência:** subida ou queda quando a diferença entre a 1ª e a 2ª metade das jogadas é ≥ 12 pontos.
- **Jeito de aprender principal:** só aparece com ≥ 2 jogadas e ≥ 6 fases no formato e domínio médio ≥ 60.
- Apresentação em **radar/pentagrama de habilidades** (um eixo por formato), para o aluno e para o professor.
- O cálculo fica em `packages/core/src/aprendizagem.ts` e é **idêntico** no app e na web.

Por que não usar só o acerto final: ele sempre chega a 100%, porque o aluno pode tentar de novo.

### 4.7 Acessibilidade (desde o início, não como extra)

- Tamanho do texto: normal, grande e muito grande.
- Leitura em voz (síntese do sistema, pt-BR) de enunciados, dicas e retornos.
- Fonte **Lexend** para dislexia.
- **Alto contraste** aplicado sem reiniciar o app (ADR 0005).
- Redução de animações, respeitando também a configuração do aparelho.
- Toda ação de arrastar tem alternativa por toque (tocar no item e depois no destino).
- Áreas de toque ≥ 44×44 pt; estados nunca indicados só por cor.

### 4.8 App do aluno: telas e fluxo

- **Entrada:** nome e avatar/símbolo, sem e-mail. Ainda não há login real; a especificação prevê entrada com **código da turma**.
- **Abas:** Início, Níveis, Conquistas e Perfil.
- **Início:** céu do mapa atual, próxima missão em destaque, desafio do dia e dias de luz.
- **Níveis:** trilha com os mapas recolhíveis (só o atual aberto).
- **Partida:** fases com enunciado, lâmpada de dica, área de interação e botões fixos no rodapé. Retorno imediato e encorajador.
- **Resultado:** estrelas, pontos de luz, avanço da constelação, acertos de primeira, tentativas e tempo.
- **Conquistas:** conquistas, dias de luz e análise de aprendizagem (jeito principal, cartão por formato, formatos não experimentados, missão sugerida).
- **Perfil:** editar avatar e nome, capa, álbum de constelações, acessibilidade, vibração, liberar níveis, sobre, apagar progresso.
- **Relatório da semana** para a família (compartilhável; a especificação pede PDF A4).
- Funciona **sem internet**; o progresso fica no aparelho.

### 4.9 Painel do professor (web): seções

Rotas em `apps/web/app/professor`:

- **Entrar:** login do professor, ainda provisório.
- **Visão geral:** começa pela **agenda do professor** (aulas da semana), depois alertas e turmas.
- **Turmas** e **ficha da turma:** alunos, acerto médio, formatos.
- **Alunos** e **ficha do aluno:** radar, indicadores, histórico e insights.
- **Desempenho:** gráficos por formato e evolução no tempo.
- **Habilidades:** pentagrama de habilidades por aluno e turma, com insights.
- **Planejamento:** lista de planos, calendário mensal, formulário de plano de aula e registro da aula (ADR 0010).
- **Atividades:** o professor monta atividades e as envia ao app (ADR 0011).
- **Metas (indicadores SMART, ADR 0012):** aba da turma com IND-01 a IND-06 (acerto médio ≥ 70%, alunos abaixo de 60% ≤ 15%, formato com menor acerto ≥ 60%, conclusão ≥ 85%, participação ≥ 90%, tentativas ≤ 1,8), janela de 4 semanas, comparação com as 4 anteriores, situação escrita e ação sugerida. Cálculo em `packages/core/src/indicadores-smart.ts`.
- **Navegação (ADR 0013):** menu lateral com nomes visíveis em grupos (Acompanhar; Planejar); no celular, botão "Menu" com gaveta.

**Plano de aula (ADR 0010):** turma, data, horário, duração, tema, unidade temática e habilidades da BNCC, objetivos, conteúdos, metodologia, formatos de atividade, recursos, avaliação, alunos em acompanhamento, observações, situação (rascunho, planejada ou realizada) e registro da aula. O formulário mostra, ao lado, o acerto da turma por formato e os alunos que pedem atenção.

**Atividades do professor (ADR 0011):** quatro formatos com questões próprias (objetiva, completar, associação e sequência), ou escolha de uma missão pronta do app (montagem, manipulação e 3D dependem do jogo). Cada atividade tem título, instrução, habilidade BNCC, turmas, data de liberação e, opcionalmente, o plano de aula. Formato fixo de conteúdo, que será o contrato com o app:

- objetiva: enunciado, alternativas e índice da correta;
- completar: texto com respostas entre colchetes, ex.: `25% de 80 é [20]`;
- associação: pares (lado A, lado B);
- sequência: itens na ordem certa (o app embaralha).

**Etapas do painel (ADR 0009):**

1. Acesso
2. Turmas e alunos
3. Desempenho
4. Pentagrama e insights
5. **Integração real com a API** (a fazer)

Até a etapa 5, o painel usa dados de demonstração (`MockDataProvider`) atrás da mesma interface (`DataProvider`) que a API vai atender.

### 4.10 Perfis de usuário

| Perfil | Onde | Faz o quê |
|---|---|---|
| Aluno | App | Joga, acompanha o próprio progresso, personaliza, acessibilidade |
| Professor | Web | Vê turmas e alunos, analisa, planeja, cria atividades, avalia e dá feedback |
| Gestão / Diretora | Web | Cadastra turmas e vínculos |
| Administrador | Web | Cadastra, edita e desativa usuários |
| Família | Relatório (PDF/compartilhamento) | Acompanha a evolução |

---

## 5. Tecnologia

| Camada | Escolha |
|---|---|
| Repositório | Monorepo **pnpm + Turborepo**, TypeScript em tudo |
| App do aluno | **React Native 0.86 + Expo SDK 57**, React 19.2, Expo Router, react-native-gesture-handler; 3D com expo-gl + three.js; progresso em AsyncStorage; preferências em expo-sqlite (kv-store); voz com expo-speech; vibração com expo-haptics |
| Web | **Next.js 15 + Tailwind v4**, apenas como front-end (sem rotas de API próprias) |
| Núcleo | `packages/core`: missões, níveis, constelações, cálculo de resultado, formatos, indicadores, aprendizagem, schemas, `DataProvider`, com testes |
| Back-end (proposto) | Node.js + **NestJS** + **Prisma** + **PostgreSQL**, hospedado no **Railway**; importa o `packages/core` |
| Validação atual | App testado no iPhone pelo **Expo Go**; ainda sem contas da Play Store e da App Store |

Estrutura:

```
apps/mobile/     app do aluno (Expo)
apps/web/        painel do professor (Next.js) — rotas /professor
packages/core/   regras de negócio compartilhadas
docs/            Especificação de Requisitos, PRD, ADRs, plano de ação
```

---

## 6. Decisões registradas (ADRs)

| Nº | Decisão | Status | Por quê, em uma linha |
|---|---|---|---|
| 0001 | Monorepo com núcleo de regras compartilhado | Aceita | Aluno e professor precisam ver os mesmos números; as regras ficam num lugar só. |
| 0002 | App do aluno em React Native com Expo | Aceita | Android e iOS com um código; gestos nativos; a equipe já conhece React/TS. Flutter e nativo foram descartados. |
| 0003 | Progresso no aparelho e uso sem conexão | Aceita | A internet nas escolas é instável; permitiu validar antes de existir o servidor. |
| 0004 | Última estrela só com o mapa completo | Aceita | Evita completar a constelação repetindo a missão mais fácil; força a variedade de formatos, que alimenta a análise. |
| 0005 | Alto contraste sem reiniciar o app | Aceita | Reiniciar tirava o aluno da tela; barreira justamente para quem precisa do recurso. |
| 0006 | Análise de aprendizagem pelo domínio de cada formato | Aceita | Uma jogada só não pode rotular o aluno; combina acerto de primeira, autonomia e precisão. |
| 0007 | Back-end Node.js + NestJS + Prisma + PostgreSQL no Railway | **Proposta** | Reaproveita o núcleo em TypeScript. Java, Python, .NET e Supabase foram descartados. |
| 0008 | Painel do professor em Next.js com TypeScript | Aceita | Já configurado no projeto; usado só como front-end, consumindo a API. |
| 0009 | Painel construído em 5 etapas | Aceita | Cada etapa é testável sozinha; a integração com a API acontece num ponto só. |
| 0010 | Planejamento de aulas no painel | Aceita | O professor vê os dados e planeja no mesmo lugar; o dado vira decisão pedagógica. |
| 0011 | Atividades montadas pelo professor e enviadas ao app | Aceita | O professor adapta o conteúdo à turma com formatos que o app consegue corrigir e medir. |
| 0012 | Indicadores SMART no painel do professor | Aceita | Todo número diz o que mede, a meta, o período e o que fazer. |
| 0013 | Navegação do painel com nomes visíveis e agrupados | Aceita | Reconhecer em vez de lembrar (Nielsen), menos opções por vez (Hick), alvos maiores (Fitts). |
| 0014 | Documentação por PRD de módulo, no lugar da SRS | Aceita | Orientação do professor: cada módulo com requisitos, histórias e critérios de aceite. |

Convenção dos ADRs: um ADR aceito não é reescrito; mudanças viram um novo ADR que substitui o anterior. Cada ADR registra os decisores e o **uso de IA**: a IA ajudou a levantar alternativas e a escrever o código, mas **as decisões são da equipe**.

---

## 7. Documentação (organizada em 04/11/2026)

Por orientação do professor, **não há mais Especificação de Requisitos (SRS)**: cada módulo do sistema é um PRD com requisitos, histórias de usuário e critérios de aceite (ADR 0014). A pasta `docs/` é separada por tipo:

| Pasta | Conteúdo |
|---|---|
| `docs/00-modelos/` | Modelo de PRD de módulo |
| `docs/01-produto/` | **PRD — Modolume**: visão do produto (problema P1–P6, usuários, objetivos SMART, escopo, fases, riscos) |
| `docs/02-modulos/` | **PRD-01 a PRD-17**: AUT, ADM, TUR, MIS, GAM, ALU, PER, ACE, REL, HIS, APR, PRF, PLA (novo), ATI, AVA, NOT e QUA (requisitos não funcionais, interfaces, restrições e matriz de permissões) |
| `docs/03-decisoes/` | ADRs 0001 a 0014 e o índice |
| `docs/04-ux/` | Diretrizes de usabilidade do painel (Nielsen, Hick, Fitts e checklist) |
| `docs/05-referencia/` | Este documento |
| `docs/99-arquivo/` | SRS v0.1, PRD v0.1 e plano de ação antigo (só histórico) |

Cada PRD de módulo tem: resumo, problema, usuários, objetivos SMART, requisitos (`MOD-XXX-NNN`, com prioridade, verificação e **situação no sistema**: Implementado, Parcial, Pendente ou A medir), regras de negócio, histórias de usuário (`HU-XXX-NN`), critérios de aceite ("Dado…, quando…, então…", marcados `[x]` quando já atendidos), fases, diretrizes, riscos, pendências e links. Os links internos usam o formato do Obsidian (`[[...]]`).

Regras de negócio novas, que já existiam no sistema e foram documentadas: RN-12 (aluno pede atenção: acerto < 60% ou queda ≥ 10 pontos), RN-13 (indicadores SMART), RN-14 a RN-28 (login, usuários, turmas, sincronização, planejamento, atividades e feedback).

---

## 8. Regras de negócio (resumo)

| ID | Regra |
|---|---|
| RN-01 | Estrelas: 3 com acerto de primeira ≥ 90%; 2 com ≥ 60%; 1 nos demais. |
| RN-02 | Pontos de luz = fases + acertos de primeira + 3. |
| RN-03 | A cada 5 pontos de luz no mapa, acende uma estrela, até a penúltima. |
| RN-04 | A última estrela só com todas as missões do mapa concluídas. |
| RN-05 | Um mapa abre quando o anterior é concluído, salvo liberação pelo professor. |
| RN-06 | A dica não tira pontos, mas entra no cálculo da autonomia. |
| RN-07 | Domínio = 65% acerto de primeira + 20% autonomia + 15% precisão (10 jogadas mais recentes). |
| RN-08 | Níveis 75/50; tendência com diferença ≥ 12 pontos. |
| RN-09 | Jeito principal só com ≥ 2 jogadas, ≥ 6 fases e domínio ≥ 60. |
| RN-10 | Itens comprados são permanentes; as luzes gastas não voltam. |
| RN-11 | O desafio do dia é igual para todos na data e dobra os pontos uma vez por dia. |

---

## 9. Restrições, privacidade e ética

- Usuários menores de idade: **LGPD e ECA**. Consentimento dos responsáveis ou base legal firmada com a escola.
- O app coleta **só** nome, turma, avatar e dados de jogo. Sem publicidade e sem compartilhamento com terceiros.
- A escola pode exportar e excluir os dados de um aluno a pedido do responsável.
- Conteúdo limitado à Matemática do Ensino Fundamental, alinhado à BNCC.
- Fora do escopo: outras disciplinas, chat, videoaulas, integração com diário e boletim.

---

## 10. Identidade visual e tom

- **Paleta:** roxo `#7B61FF` (principal), pêssego `#FFAC7A`, lilás `#C9B4FF`, azul claro `#8FD3FF`, azul profundo `#1E2A78` e branco. Rosa `#FF7CA7` só no mascote.
- **Fontes:** Poppins (títulos), Inter (texto) e Lexend (opção para dislexia).
- **Proibido:** emojis, gradientes na interface (o único degradê é o do símbolo da marca) e blur excessivo.
- **Tom:** moderno, intuitivo e organizado. O "infantil demais" foi rejeitado (coruja e bichinhos saíram); o mascote Lilo ficou.
- **Painel do professor:** agenda primeiro, cor da marca como identidade, pouca tabela, números-chave grandes. Visual "planilha" e cinza institucional foram rejeitados.
- **Evitar "cara de IA":** cartões iguais empilhados, rótulos em CAIXA ALTA espaçada, grades de estatísticas genéricas e "Olá, Nome". Preferir formas ligadas ao tema (céu, trilha, bilhete de desafio).
- Cenários ilustrados com objetos realistas (cédulas de Real, mercado, horta) são aceitos dentro das atividades.

---

## 11. Estado atual e próximos passos

**Pronto ou avançado**

- App do aluno com 8 mapas, 28 missões, gamificação completa, mascote, loja, avatar, acessibilidade, relatório e uso offline.
- Núcleo com regras e testes.
- Painel do professor com as etapas 1 a 4 (dados de demonstração), planejamento de aulas e editor de atividades.
- Especificação de Requisitos completa e 11 ADRs.

**A fazer**

- Etapa 5: API real (NestJS + Prisma + PostgreSQL no Railway), login real e jogadas do app chegando ao painel.
- Entrada do aluno por código da turma; sincronização offline → servidor.
- App receber as atividades criadas pelo professor.
- Gestão e administração na web (turmas, vínculos, usuários).
- Validação com a escola parceira (consentimento, sessões de teste com alunos, métricas).
- Publicação nas lojas (fora do MVP).
- Atualizar o README e o plano de ação.

**Questões em aberto**

- Qual escola, turmas e séries vão participar da validação?
- Como será obtido o consentimento dos responsáveis?
- Os pesos do domínio serão fixos ou ajustáveis pelo professor?
- A gestão terá um painel próprio?
- O feedback do professor aparece no relatório da família?
- Qual é a próxima disciplina, se houver?
- Metas numéricas das métricas de sucesso do PRD.

---

## 12. Orientações para quem for escrever a documentação

- Escrever em **português do Brasil**, linguagem clara e formal acadêmica (normas ABNT nas referências).
- Sempre apresentar o Modolume como **ponte aluno ↔ professor**, não como "app de Matemática".
- Usar os termos do projeto: missão, fase, mapa, formato de atividade, pontos de luz, luzes, constelação, desafio do dia, dias de luz, acerto de primeira, autonomia, precisão, domínio, radar/pentagrama de habilidades, Lilo.
- Ligar tudo em cadeia: **problema (PRD do produto) → PRD de módulo → requisito (`MOD-XXX-NNN`) → história de usuário → critério de aceite**, e o ADR quando a decisão for técnica.
- Todo indicador para o professor deve ser SMART; toda tela deve passar pelo checklist das Diretrizes de usabilidade.
- Não citar nenhuma escola real; usar "escola parceira".
- Ao falar de IA, deixar claro que ela auxiliou, mas que as decisões são da equipe.
- Não inventar dados de pesquisa ou números da escola. Marcar como **[A DEFINIR]** o que depender da equipe.
