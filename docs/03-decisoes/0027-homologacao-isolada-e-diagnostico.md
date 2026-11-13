# ADR 0027 — Homologação isolada e diagnóstico antes do APK

- **Status:** Aceita; ativação externa e aceite físico acompanhados no roteiro
- **Data:** 13/11/2026
- **Decisores:** Ana Barbiero — Líder de projeto
- **Uso de IA:** preparação dos ambientes, configuração de build, instrumentação e testes automatizados.

## Contexto

Testar por padrão no banco principal mistura experimentos com o ambiente publicado. A validação da URL
da API não cobria o perfil `preview`, que gera o APK. Falhas de tela e de API precisavam de diagnóstico
com menos risco de registrar credenciais ou dados escolares.

## Decisão

Criar `homologacao` no Railway, com banco e API próprios, credenciais diferentes e dados exclusivamente
fictícios. O pre-deploy confere nome do ambiente, flag explícita, destino das conexões e uma marca do banco;
recusa produção e bases preexistentes sem a marca. Migrações, papel mínimo e carga fictícia são idempotentes.
Os segredos ficam nas variáveis do serviço e em arquivos locais ignorados. Não são copiados do ambiente
principal. O painel de homologação deve usar a mesma API que o APK de teste.

Sessão, cache e filas locais também são separados pelo endereço canônico da API. A API de produção
`https://api.modolume.com.br` conserva o espaço histórico para preservar a atualização de instalações
anteriores. Outros servidores usam prefixos próprios, inclusive no SecureStore, sem importar nem limpar
dados de produção. Assim, IDs fictícios iguais em bases distintas não compartilham progresso ou credenciais.

`preview` e `play-internal` usam o ambiente EAS `preview`; `production` usa `production`. Todos os perfis
distribuídos exigem URL HTTPS pública. Bloquear permissões Android de sobreposição, armazenamento externo
legado e biometria que não são usadas pelos fluxos atuais; conferir novamente o manifesto do artefato final.

O app recebe uma tela de recuperação para erros de renderização. A integração Sentry é opcional e não
inicializa sem DSN. Quando configurada, usa filtragem por lista permitida, sem corpo HTTP, valores locais,
identificação de aluno, mensagens de erro livres, screenshots, replay ou breadcrumbs. Mapas de código exigem
organização, projeto e token privado de build. A ativação real e a inspeção dos eventos dependem de criar
o projeto Sentry; a equipe informou não possuir um nesta revisão.

A API registra rota parametrizada, status, duração e identificador de requisição. Erros inesperados têm
resposta genérica; corpos, tokens e mensagens brutas não são registrados. `/prontidao` consulta o banco
e retorna 503 quando indisponível. A checagem de implantação e os backups recorrentes são configurados
e conferidos no provedor; um script preparado não é descrito como serviço externo já ativado.

## Alternativas consideradas

- Usar a base principal para todos os testes: reduz isolamento e torna ensaios destrutivos arriscados.
- Habilitar telemetria completa por padrão: desnecessário para o diagnóstico inicial e amplia coleta.
- Considerar o bundle Android como aceite: não comprova instalação, permissões finais, jogos nativos ou uso offline.

## Consequências

Os ambientes de teste exigem manutenção e recursos próprios no provedor. Não recebem dados reais ou chaves
de envio de e-mail por padrão. A conta Sentry, a homologação física e as definições institucionais de
privacidade, retenção e exclusão continuam dependências explícitas antes do piloto com dados reais.

## Aprovação da revisão documental

- **Data da revisão e aprovação:** 13/11/2026.
- **Assinatura de aprovação:** Ana Barbiero — Líder de projeto.
- **Escopo:** organização técnica solicitada; não constitui definição de retenção ou aprovação jurídica institucional.
