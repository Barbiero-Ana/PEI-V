# Testes e verificações

Base: branch `feat/backend-guilherme`, até `0deda39`. Revisão: 06/11/2026. Inventário por leitura dos testes e scripts. As suítes não foram executadas nesta revisão documental; não há resultado de aprovação atribuído a esta etapa.

## Comandos automatizados

Pré-requisito: dependências instaladas, conforme [guia Windows](Executar%20localmente%20no%20Windows.md). Execute cada comando na raiz do repositório, em PowerShell. Use o código de saída e o resumo emitido pela ferramenta como evidência, sem antecipar que haverá aprovação.

```powershell
# HTTP NestJS com banco simulado, via node:test e tsx.
pnpm.cmd --filter @modolume/api test

# Regras do núcleo, via Vitest.
pnpm.cmd --filter @modolume/core test

# Análise estática; não é teste funcional.
pnpm.cmd --filter @modolume/api typecheck
pnpm.cmd --filter @modolume/core typecheck
pnpm.cmd --filter @modolume/web typecheck
```

Resultado esperado quando aprovados: ausência de falhas e código de saída zero. Nos testes, conferir também quantidade executada e eventuais casos ignorados. `pnpm.cmd test` na raiz usa Turbo; para diagnóstico sem confundir cache com nova execução, prefira os comandos diretos acima. Os testes da API não precisam iniciar o banco nem carregar `.env`; injetam um substituto para `Banco` e usam segredos exclusivos de teste.

## Cobertura existente

| Arquivo                                       | Comportamentos cobertos                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/senha-provisoria.test.ts`       | Bloqueio de operações e consultas de professor, coordenação e admin enquanto senha é provisória; exceções de consulta da conta e troca; liberação com mesmo token; rejeição de senha incorreta, curta ou repetida; nova consulta após redefinição; papel, inatividade, JWT inválido/expirado e regressão de acesso do aluno.           |
| `apps/api/src/ciclo-aluno.test.ts`            | Revogação na transferência, login na turma atual, edição sem transferência, retorno à origem, turma divergente no token, encerramento/reabertura, turma encerrada com versão atual, encerramento de outra turma, cadastro/transferência recusados, destino inexistente/de outra escola, matrícula duplicada, inatividade e permissões. |
| `packages/core/src/missoes.test.ts`           | Consistência do catálogo, mapas e fases; resultado, estrelas, dicas e progressão.                                                                                                                                                                                                                                                      |
| `packages/core/src/constelacoes.test.ts`      | Pontos de luz, dobro no desafio, estrelas, conclusão e seleção do desafio diário.                                                                                                                                                                                                                                                      |
| `packages/core/src/aprendizagem.test.ts`      | Cálculo de domínio/autonomia, níveis, dados insuficientes, evolução e sugestões.                                                                                                                                                                                                                                                       |
| `packages/core/src/indicators.test.ts`        | Resumo, filtro de turma, desempenho por formato/aluno, evolução mensal e aluno inexistente.                                                                                                                                                                                                                                            |
| `packages/core/src/indicadores-smart.test.ts` | Componentes SMART, janela de quatro semanas, percentuais, formato de menor acerto, ausência de dados e situação das metas.                                                                                                                                                                                                             |

Na suíte do ciclo do aluno, o bloqueio é verificado em `GET/PATCH /aluno/eu`, `GET /aluno/atividades`, `POST /aluno/jogadas` e `GET/PUT /aluno/progresso`.

## Limitações dos testes

As suítes HTTP criam uma aplicação NestJS de teste com controllers e guardas reais, mas substituem Prisma por objetos em memória. Não inicializam o módulo principal completo. Portanto, não comprovam PostgreSQL real, instalação Windows, migrações, permissões SQL, CORS, limites globais de requisição ou interface Next.js.

O fake de `$transaction` na suíte do aluno usa `Promise.all`; não verifica rollback/isolamento transacional PostgreSQL. Histórico e progresso são fixtures congeladas e comparadas; isso não comprova preservação de relações persistidas em um banco real.

Não foram encontradas suítes automatizadas próprias de web/mobile ou configuração de CI em `.github` neste checkout. `lint` da API/núcleo executa `tsc --noEmit`; web declara `next lint`. Não trate esses comandos como cobertura funcional nem como aprovação observada.

## Homologação manual com PostgreSQL real

Use uma base local destinada a testes, contas e turmas preparadas. Siga o [guia Windows](Executar%20localmente%20no%20Windows.md) para verificar destino, conexão e ausência de dados simulados. Login, troca de senha, transferências, encerramento e reabertura escrevem no banco; execute conscientemente sobre dados de teste.

| Cenário                          | Procedimento                                                                                          | Resultado esperado pelo código                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Integração                       | Login de conta existente; abrir dados conhecidos; parar API e tentar novo login; reiniciar API        | Consulta real com API disponível; erro de comunicação quando parada.                                                     |
| Senha provisória                 | Entrar com conta provisória; tentar rota protegida da equipe; consultar `/auth/eu`; trocar senha      | Rota protegida retorna 403; consulta própria é permitida; troca válida libera acesso. A web leva a `/conta/senha`.       |
| Encerramento                     | Manter sessão de aluno; administrador encerra sua turma                                               | Versões incrementadas; JWT antigo retorna 401; identificação/login do aluno também são recusados.                        |
| Turma encerrada com versão atual | Exercitar guarda com token de versão atual e turma encerrada em ambiente de teste                     | 403 pela turma inativa; não confundir com 401 por versão antiga.                                                         |
| Reabertura                       | Administrador reabre; repetir chamada com sessão antiga e depois autenticar novamente                 | Token antigo continua inválido; novo login pode acessar turma reaberta se aluno estiver ativo.                           |
| Transferência                    | Manter JWT anterior em cliente de teste privado; transferir aluno; repetir chamada e fazer novo login | Token antigo retorna 401; novo token representa turma de destino e nova versão; atividades são consultadas para destino. |
| Persistência                     | Comparar histórico/progresso e dados após reiniciar API/web                                           | Dados preservados; requer conferência no banco real, não apenas fixtures.                                                |

Para repetir chamadas autenticadas, use cliente HTTP de teste mantendo credenciais e tokens privados. Não salve cabeçalhos, respostas de autenticação ou segredos como evidência pública. Uma tela offline no app, isoladamente, não prova que uma requisição foi aceita pelo servidor.

### Evidência manual relatada

Por solicitação da equipe nesta etapa, ficam registrados como **evidências manuais relatadas**: bloqueio por senha provisória; encerramento e reabertura de turma; invalidação de JWT após transferência; novo login na turma de destino.

Esses relatos não são resultados das suítes automatizadas nem execuções realizadas nesta revisão. Não foram fornecidos data da execução, responsável, identificação da base, versão exata executada, respostas HTTP ou artefatos verificáveis. Também não demonstram, por si, que o frontend estava sem dados simulados. Registrar esses metadados em nova homologação, sem incluir segredos.

## Como registrar uma execução futura

Anote commit (`git rev-parse --short HEAD`), versões (`node --version`, `pnpm.cmd --version`), comando/pasta, data, responsável, código de saída e resumo. Para homologação manual, acrescente cenário, base local identificada sem URL, esperado, observado e limitações. Mantenha separadas as categorias inspeção de código, teste automatizado simulado e homologação PostgreSQL.

Consulte o [histórico das correções](../07-historico/Corre%C3%A7%C3%B5es%20de%20backend.md) para associar os testes aos commits.
