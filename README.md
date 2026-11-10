# Modolume

*Ideias que se iluminam.* O Modolume é uma ponte entre aluno e professor. Mais do que um app para
praticar Matemática, ele mostra ao professor **como cada aluno aprende**: enquanto o aluno resolve
atividades em formatos diferentes (associar imagens, montar, ordenar, manipular objetos, explorar em 3D),
o sistema identifica em quais formatos ele compreende melhor e onde tem mais dificuldade.

Com essa leitura, o professor consegue **reestruturar provas e planos de aula de forma objetiva**,
escolhendo os formatos que funcionam para cada aluno e dando atenção a quem tem mais dificuldade.
A Matemática é o ponto de partida.

- **App (mobile)**: a área do aluno, com as atividades em forma de minijogos visuais e interativos.
- **Web**: a área do professor, com o perfil de aprendizagem de cada aluno e da turma (em desenvolvimento).

## O que tem hoje

28 missões de Matemática, em 8 mapas, todas com **manipulação direta** e partindo de uma
**situação do dia a dia**. Toda fase tem a **lâmpada de dica** no canto (o uso
de dicas é registrado para o professor, sem tirar pontos).

| Mapa (constelação) | Missões |
|---|---|
| 1 · Primeiros passos (Órion) | Ligue os pares, Trilha numérica, Monte a torre, Mercadinho |
| 2 · No dia a dia (Escorpião) | Que horas são?, Jarra medidora, Partes do todo, Votação da turma |
| 3 · Pensar e equilibrar (Cruzeiro do Sul) | Reta numérica, Balança equilibrada, Caminho do entregador |
| 4 · Espaço e formas (Cassiopeia) | Construtor de cubos, Explorador de sólidos, Espelho mágico |
| 5 · Construir no espaço (Plêiades) | Planificação do dado, Cubinhos escondidos, Ficha dos sólidos |
| 6 · Desafios de mestre (Cão Maior) | Dividir em partes iguais, Cerca da horta, Gire na medida |
| 7 · Além dos números (Lira) | Termômetro maluco, Pizza equivalente, Promoção da loja, Caça ao tesouro |
| 8 · Mestre dos números (Águia) | Máquina misteriosa, Sorteio justo, Nivelando as torres, Calculadora maluca |

### Gamificação: o céu que se ilumina
- Cada **mapa** (nível) monta uma **constelação**. Cada missão concluída gera
  **pontos de luz** (1 por fase + 1 por acerto de primeira + 3 por terminar);
  **a cada 5 pontos, uma estrela acende**.
- Mapa completo → **celebração animada** (estrelas acendendo, linhas se
  desenhando, estrela cadente) e a constelação vai para o **álbum "Meu céu"** no perfil.
- **Desafio do dia**: uma missão sorteada por data, vale **pontos em dobro**.
- **Dias de luz**: semana no início e calendário em Conquistas. Sem punição.
- Durante a validação, **todos os mapas ficam liberados** (Perfil → "Liberar todos os níveis").

Regras em `packages/core/src/constelacoes.ts`; conteúdo em `packages/core/src/missoes.ts`.

Fluxo: **entrar** (escolhe símbolo + nome) → **início** (jornada, próxima missão,
missões, acertos por formato, conquistas) → **partida** (fases; o símbolo da marca
reage a erros e acertos) → **resultado** (estrelas, acertos de primeira, tentativas, tempo).

Cada jogada gera um `ResultadoJogada` (`packages/core/src/missoes.ts`) com
formato, tentativas, % de acerto e tempo, que é o mesmo dado que vai alimentar
os indicadores do professor.

## App (React Native / Expo) — principal

`apps/mobile` é o aplicativo do aluno, feito com **Expo SDK 58** (React Native 0.88.1):

- **Barra de navegação** inferior: Início, Níveis, Conquistas e Perfil.
- **Níveis**: as missões ficam em 8 mapas, do "Primeiros passos" ao "Mestre dos números".
  Um mapa abre quando o anterior é concluído. No Perfil, "Liberar todos os níveis" é o
  modo apresentação.
- **Perfil**: editar nome/símbolo, vibração, liberar níveis, sobre, apagar progresso, sair.
- **Jogos com toque nativo**: arrastar (gesture-handler), pintar passando o dedo,
  balança com mola, e 3D com expo-gl + three.js (1 dedo gira, 2 dedos aproximam).
- Progresso salvo no aparelho (AsyncStorage) e vibração (expo-haptics).

```bash
pnpm install
pnpm mobile        # abre o Expo; leia o QR code com o app Expo Go no celular
```

Celular e computador precisam estar na mesma rede Wi-Fi. Para gerar o APK/IPA:
`npx eas-cli@latest build` (ver `apps/mobile/AGENTS.md`).

**No emulador do Android Studio** (build nativo, com o projeto em `apps/mobile/android`):

```bash
pnpm --filter @modolume/api dev                          # API (o app busca turma e atividades nela)
cd apps/mobile && npx expo start --lan --port 8081       # Metro, em outro terminal
cd apps/mobile && npx expo run:android --no-bundler --device Pixel_8_Pro   # compila e instala
```

`--device` recebe o **nome do emulador** (lista: `emulator -list-avds`), não o id do `adb`. Se o emulador mostrar uma
versão antiga do app, é o APK de uma compilação anterior: rode o `run:android` de novo.

O monorepo usa `nodeLinker: hoisted` (em `pnpm-workspace.yaml`). Não troque: no Windows, o build nativo (ninja/CMake)
não aceita caminhos com mais de 260 caracteres, e a estrutura aninhada padrão do pnpm passava desse limite. Depois de
mudar dependências nativas, apague `android/build`, `android/app/build`, `android/.gradle` e `android/app/.cxx`.

## Estrutura

```
apps/mobile/       Expo (React Native) — app do aluno
  src/app/         rotas: (abas)/ início, níveis, conquistas, perfil · jogar/[id] · entrar
  src/componentes/ jogos/, 3d/Palco3D, partida, ícones e avatares (SVG)
  src/lib/         arraste nativo, useUltimo, embaralhar
apps/web/          Next.js — página inicial com os planos (/) e painel do professor (/professor)
  app/             entrar, mapa (/), jogar/[id]
  components/      símbolo da marca, avatares, ícones (SVG), partida, jogos/
  lib/             arraste (pointer events), cena3d (three.js), embaralhar
apps/api/          NestJS + Prisma + PostgreSQL — liga o app ao painel (ADR 0015)
packages/core/     domínio: missões, níveis, cálculo de resultado,
                   formatos de atividade, indicadores do professor
docs/              documentação: PRD do produto, PRDs de módulo, ADRs, UX (ver docs/README.md)
```

## Rodar tudo integrado (app ↔ API ↔ painel)

A API (`apps/api`, NestJS + Prisma + PostgreSQL) liga o app do aluno ao painel do professor (ADR 0015).

```bash
pnpm install
pnpm --filter @modolume/api banco:local   # PostgreSQL de desenvolvimento (deixe aberto)
pnpm --filter @modolume/api db:migrar     # cria as tabelas pelas migrações versionadas
pnpm --filter @modolume/api db:seed       # dados de demonstração (turmas LUZ6AM e LUZ6BT)
pnpm --filter @modolume/api dev           # API em http://localhost:3333
pnpm web                                  # painel em http://localhost:3000/professor
pnpm mobile                               # app (Expo)
```

Arquivos de ambiente (fora do git):

- `apps/api/.env`: `DATABASE_URL` (usuário `modolume_api`, usado pela API), `DIRECT_URL` (administrador, usado só pelas
  migrações), `JWT_SEGREDO`, `PORTA`, `ORIGENS`, `SENHA_DEMO` (modelo em `.env.example`).
- `apps/web/.env.local`: `API_URL=http://localhost:3333`. Sem essa linha, o painel usa os dados de demonstração.
- `apps/mobile/.env.local`: `EXPO_PUBLIC_API_URL=auto` em desenvolvimento (o app usa a API do mesmo computador
  que serve o código, porta 3333, mesmo quando o IP da rede muda); publicado, o endereço do Railway. Sem essa
  linha, o app funciona só no aparelho.

Login de demonstração do painel (todas com a senha de `SENHA_DEMO`), cada papel abre a sua área (ADR 0019):

- professor: `marina.alves@escola.example` → `/professor`;
- coordenação: `coordenacao@escola.example` → `/coordenacao` (acompanha a escola e vincula professores às turmas);
- administrador: `admin@escola.example` → `/admin` (equipe e permissões, turmas e alunos, registro de atividades).

Num banco que já tem dados, `pnpm --filter @modolume/api db:seed` só cria as contas de coordenação e administrador que faltarem. No app, o aluno entra com o
**código pessoal** (no painel, no perfil do aluno: Alunos → nome do aluno → "Acesso ao app") e cria um PIN de 4
números no primeiro acesso (ADR 0017). No mesmo bloco, o professor zera o PIN ou gera um código novo.

**Railway:** o banco de produção já está criado (migração aplicada, seed e usuário `modolume_api`). Deste computador,
o `.env` usa a URL pública do Postgres (TCP Proxy, `maglev.proxy.rlwy.net`); a API publicada dentro do Railway pode
usar a URL interna (`postgres.railway.internal`). Para voltar ao banco local, troque as duas URLs pela
`DATABASE_URL_LOCAL` e rode `banco:local`.

O serviço da API no Railway usa **Railpack** com a raiz do repositório, pois precisa de `packages/core`.
O `railpack.json` gera o cliente Prisma no build e o inclui na imagem de execução. O script `start` da raiz
inicia somente a API. Configure **Pre-Deploy Command** como `pnpm --filter @modolume/api db:migrar` e
**Healthcheck Path** como `/saude` nas configurações do serviço. A migração usa `DIRECT_URL` e requer a CLI
Prisma na imagem. Mantenha as dependências de desenvolvimento disponíveis para essa etapa.

## Site (página inicial e painel)

```bash
pnpm web     # http://localhost:3000/entrar
```

O app do aluno é exclusivo de Android e iOS. A raiz de `apps/web` abre o login da equipe, com um painel para cada papel
institucional (ADR 0021). O [roteiro da Google Play](docs/08-engenharia/publicacao-android.md) descreve as etapas para gerar e validar o AAB.

## Identidade visual

Paleta oficial: roxo `#7B61FF`, pêssego `#FFAC7A`, lilás `#C9B4FF`, azul claro
`#8FD3FF`, azul profundo `#1E2A78` e branco. Poppins nos títulos, Inter no texto.
Interface plana (sem gradientes nem blur); o único degradê é o do símbolo da
marca. Sem emojis: símbolo, avatares e ícones são SVG próprios.
