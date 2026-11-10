# Plano de ação prioritário — Modolume

Data: 06/11/2026  
Base da auditoria: commit `73f9f38`  
Situação: ações propostas, ainda não executadas neste documento.

## Objetivo e limites

Corrigir primeiro os problemas que podem misturar ou perder dados, produzir indicadores pedagógicos incorretos ou impedir a entrega. Depois, completar os requisitos e a homologação necessários ao uso institucional.

Este plano deriva da comparação do código com o PRD geral e os 17 PRDs de módulos. Os achados de código são distintos das verificações executadas: passaram 43 testes do núcleo, 52 testes da API e a análise TypeScript dos quatro componentes. O lint mobile passou; o lint web e a build de produção web falharam. Os testes da API usam banco simulado. Não houve homologação completa em celular físico, PostgreSQL real ou ambiente de produção.

Não considerar um item concluído apenas porque o código foi alterado: registrar a evidência do critério de conclusão e atualizar o PRD correspondente.

## Como usar as prioridades

| Prioridade | Quando atuar | Condição de entrega |
| --- | --- | --- |
| P0 — Extrema urgência | Próximo ciclo de trabalho; antes de colocar dados reais ou publicar esta versão | Bloqueia a liberação enquanto não resolvido ou tecnicamente esclarecido |
| P1 — Urgência | Após os P0, antes da validação institucional | Necessário para resultados confiáveis e operação verificável |
| P2 — Urgência média | Após estabilizar os fluxos críticos | Completar conforme o escopo aprovado do MVP |

As prioridades representam impacto e dependências, não estimativas de duração. Um item P2 contratado ou obrigatório para a validação deve subir de prioridade. Recursos explicitamente pós-MVP não precisam bloquear a entrega.

## P0 — Extrema urgência

### P0-01 — Separar os dados locais por aluno

- [ ] Implementar isolamento de progresso, histórico, compras, avatar e atividades concluídas por identidade.
- [ ] Definir tratamento separado para o uso sem conta e eventual importação autorizada desse progresso.
- [ ] Impedir que uma resposta de sincronização iniciada na conta A seja aplicada após a entrada da conta B.
- [ ] Manter as pendências de A vinculadas a A, sem enviá-las com o token de B.

**Problema:** o progresso usa a chave global `modolume:aluno:v3`. Sair da turma mantém o progresso; o login seguinte combina o progresso existente com o da nova conta. O mapa `feitas` também não é separado por aluno.

**Impacto:** mistura de conquistas e resultados entre alunos, especialmente em aparelho compartilhado; possível envio do progresso combinado para a conta errada.

**Referências:** `apps/mobile/src/estado/jogador.tsx`; `apps/mobile/src/estado/conta.tsx`. PRD-10 e requisitos de isolamento do PRD-17.

**Critério de conclusão:** A joga, sai e B entra no mesmo aparelho; B não vê nem envia dados de A. Ao retornar, A recupera seus dados e sua fila. Repetir com rede lenta, modo avião e sincronização em andamento.

### P0-02 — Corrigir a consolidação entre aparelhos

- [ ] Substituir o merge de contadores acumulados por uma estratégia que preserve operações distintas.
- [ ] Usar identificadores únicos e processamento idempotente para ganhos e compras.
- [ ] Validar compras e saldo no servidor; definir explicitamente a política de compra offline.
- [ ] Tratar concorrência e migração do progresso já existente, sem somar novamente conquistas antigas.

**Problema:** `Math.max` não soma ganhos independentes, enquanto a união das compras pode liberar dois itens e contabilizar apenas um gasto.

**Exemplo:** dois aparelhos partem de 100 pontos e ganham 10 e 20 offline. O merge atual mantém 120, em vez de 130. Duas compras distintas de 30 podem resultar em dois itens e apenas 30 de gasto.

**Referências:** `apps/mobile/src/estado/jogador.tsx`; `apps/api/src/aluno.ts`. MOD-HIS-006, MOD-GAM-008 e RN-10.

**Critério de conclusão:** ganhos independentes são preservados, reenvios não duplicam ganhos, compras não produzem saldo incorreto e operações concorrentes mantêm as mesmas garantias em PostgreSQL real.

### P0-03 — Garantir persistência da fila offline

- [ ] Remover o descarte silencioso de jogadas pendentes por `slice(-500)`.
- [ ] Persistir cada operação antes de apresentar sucesso definitivo ao usuário.
- [ ] Tratar erros de armazenamento e permitir recuperação, sem apagar pendências.
- [ ] Remover da fila somente operações confirmadas pelo servidor.
- [ ] Definir tratamento visível para registros recusados permanentemente, evitando reenvio infinito.

**Problema:** ultrapassar 500 pendências elimina as mais antigas. Falhas de gravação local são ignoradas com `catch(() => {})`.

**Referências:** `apps/mobile/src/estado/conta.tsx`; `apps/mobile/src/estado/jogador.tsx`. MOD-HIS-005, MOD-CON-001 e MOD-CON-003.

**Critério de conclusão:** mais de 500 operações offline sobrevivem ao reinício e chegam ao servidor uma única vez; falha de armazenamento é informada; queda de conexão durante o envio não perde dados.

### P0-04 — Resolver a falha de build da web

- [ ] Reproduzir e diagnosticar a falha de prerenderização de `/404`.
- [ ] Corrigir a causa identificada, sem desabilitar verificações para mascarar o problema.
- [ ] Executar novamente a build e verificar o servidor de produção.

**Evidência executada:** `pnpm.cmd --filter @modolume/web build` compilou e falhou na geração estática com `TypeError: Cannot read properties of null (reading 'useRef')`, em `/404` / `/_error`.

**Limite da conclusão:** a falha foi observada; sua causa específica ainda não foi identificada.

**Critério de conclusão:** build com saída zero; início em modo de produção; página inexistente, login e áreas protegidas funcionando sem a exceção.

### P0-05 — Corrigir os privilégios da auditoria

- [ ] Ajustar o script de criação do papel da API para não conceder alteração ou exclusão de `registro`.
- [ ] Tornar o resultado seguro independentemente de o papel existir antes ou depois das migrações.
- [ ] Conferir os privilégios efetivos do usuário da API no ambiente de implantação.

**Problema:** a migração revoga privilégios somente se o papel já existir; o script posterior concede `UPDATE` e `DELETE` em todas as tabelas. A ordem de instalação pode deixar a auditoria alterável.

**Referências:** `apps/api/prisma/sql/papel-da-api.sql`; `apps/api/prisma/migrations/20261105150000_equipe_papeis_e_registros/migration.sql`. MOD-ADM-009 e MOD-SEG-012.

**Critério de conclusão:** em uma base isolada, o papel da API consegue inserir e ler registros, mas não atualizar, excluir ou truncar a auditoria, nas duas ordens de instalação. A configuração remota não foi verificada na auditoria original.

### P0-06 — Fechar as condições de implantação com dados reais

- [ ] Verificar HTTPS e a configuração de produção, incluindo segredos próprios do ambiente.
- [ ] Exigir configuração explícita de API e impedir ativação acidental do modo demonstração em produção.
- [ ] Resolver o armazenamento seguro do token mobile, atualmente persistido com AsyncStorage.
- [ ] Confirmar com os responsáveis do projeto os instrumentos de autorização e tratamento de dados exigidos pelo próprio PRD.
- [ ] Registrar a configuração e os resultados da verificação, sem incluir segredos.

**Natureza:** pendências documentadas e verificação operacional necessária; não há afirmação de que a implantação remota foi inspecionada ou de conformidade jurídica comprovada.

**Referências:** MOD-SEG-002, MOD-SEG-005, MOD-SEG-008 e MOD-IC-001; `apps/mobile/src/estado/conta.tsx`; `apps/web/lib/painel/api.ts`; `apps/web/app/professor/acoes.ts`.

**Critério de conclusão:** ambiente real identificado e validado, conexão protegida, sessão armazenada adequadamente e pendências institucionais aprovadas pelos responsáveis antes de usar dados reais.

## P1 — Urgência

### P1-01 — Corrigir a unidade do indicador de tentativas

- [ ] Definir se o indicador mede tentativas por fase ou repetição de uma atividade inteira.
- [ ] Alinhar aplicativo, API, conversão do painel, fórmula, meta e texto explicativo.
- [ ] Revisar o tratamento dos dados históricos para não misturar unidades diferentes.

**Problema:** uma missão de cinco fases perfeitas envia cinco tentativas, mas o painel compara esse número com a meta de 1,8 por atividade.

**Referências:** `packages/core/src/missoes.ts`; `packages/core/src/indicadores-smart.ts`; `apps/web/lib/painel/dados.ts`. MOD-PRF-002, MOD-PRF-008 e IND-06.

**Critério de conclusão:** uma execução perfeita não é classificada como dificuldade apenas por ter mais fases. Cobrir missões com quantidades diferentes de fases e erros.

### P1-02 — Tornar conclusão e andamento mensuráveis

- [ ] Definir eventos ou estados para início, progresso parcial e conclusão.
- [ ] Conciliar essa decisão com MOD-MIS-012, que hoje permite sair sem gerar registro de resultado.
- [ ] Distinguir no painel não iniciado, em andamento e concluído.
- [ ] Revisar o denominador e a interpretação do indicador de conclusão.

**Problema:** os resultados são produzidos ao terminar e têm conclusão de 100%; abandonos não entram na métrica. MOD-ATI-010 está marcado como implementado, embora o estado em andamento esteja ausente.

**Referências:** `packages/core/src/missoes.ts`; `apps/mobile/src/componentes/Partida.tsx`; `apps/api/src/professor.ts`. IND-04 e MOD-ATI-010.

**Critério de conclusão:** iniciar e abandonar uma atividade não é indistinguível de nunca iniciá-la; a métrica não apresenta 100% de conclusão apenas por ignorar abandonos.

### P1-03 — Unificar aprendizagem e corrigir a contagem de dicas

- [ ] Levar ao painel os campos necessários para o cálculo de domínio.
- [ ] Usar o núcleo compartilhado para o cálculo acordado no PRD-11.
- [ ] Se métricas diferentes forem mantidas, distinguir nomes e finalidades e revisar o requisito de equivalência.
- [ ] Contar fases distintas com ajuda, caso a autonomia continue definida como proporção de fases sem dica.

**Problemas:** o pentagrama web usa acerto médio e o app usa domínio; reabrir a mesma dica incrementa o contador novamente.

**Referências:** `packages/core/src/aprendizagem.ts`; `apps/web/lib/painel/pentagrama.ts`; `apps/web/lib/painel/dados.ts`; `apps/mobile/src/componentes/Partida.tsx`. RN-07, MOD-APR-002, MOD-APR-008 e MOD-ADF-001.

**Critério de conclusão:** o mesmo conjunto de jogadas produz a mesma métrica nas duas interfaces; abrir cinco vezes uma dica na mesma fase não equivale a pedir ajuda em cinco fases diferentes.

### P1-04 — Fortalecer a validação dos resultados recebidos

- [ ] Validar conjuntamente origem, missão, atividade, turma destinatária e formato.
- [ ] Definir a política para envios offline de atividades recolhidas, alteradas ou encerradas após a execução.
- [ ] Recusar vínculos inválidos com resposta explícita, em vez de gravar silenciosamente uma atividade sem vínculo.
- [ ] Validar coerência entre rodadas, tentativas, acertos, percentuais e estrelas; recalcular os valores derivados quando possível.
- [ ] Validar regras de conquistas e compras, além do formato dos dados.

**Problema:** origem `professor` permite entrada na lista de aceitas sem atividade válida; o vínculo inválido vira `null`. Limites numéricos não garantem coerência pedagógica.

**Referência:** `apps/api/src/aluno.ts`. MOD-SEG-006 e MOD-HIS-001.

**Critério de conclusão:** resultados de atividade alheia ou dados contraditórios são recusados e não contaminam indicadores; resultados offline legítimos seguem uma política documentada.

### P1-05 — Recuperar histórico suficiente em outro aparelho

- [ ] Restaurar os resultados necessários para análise e relatório, além do progresso agregado.
- [ ] Rever a retenção local de apenas 150 resultados, especialmente dentro de uma mesma semana.
- [ ] Definir e implementar a inclusão das atividades próprias do professor na análise local e no relatório.
- [ ] Evitar duplicação de resultados ao restaurar e sincronizar.

**Problema:** o novo aparelho recebe estrelas e pontos, mas não o mesmo histórico detalhado. Atividades próprias registram envio sem passar pelo mesmo armazenamento local das missões.

**Referências:** `apps/mobile/src/estado/jogador.tsx`; `apps/mobile/src/estado/conta.tsx`; `apps/mobile/src/app/relatorio.tsx`; `apps/mobile/src/app/atividade/[id].tsx`. MOD-HIS-006, MOD-REL-001 e MOD-APR-006.

**Critério de conclusão:** depois de sincronizar, dois aparelhos do mesmo aluno mostram relatório e análise equivalentes para o mesmo período; mais de 150 jogadas não tornam o relatório semanal silenciosamente incompleto.

### P1-06 — Garantir consistência entre jogada, recompensa e envio

- [ ] Definir uma unidade persistente de operação que ligue o resultado à recompensa e à pendência de sincronização.
- [ ] Garantir recuperação após encerramento do app entre essas etapas.
- [ ] Repetir envios com segurança e evitar dependência de efeitos de interface para completar a operação.

**Problema:** resultado local, fila de envio e progresso no servidor são gravados em etapas distintas. MOD-CON-002 já está parcialmente reconhecido como pendente.

**Referências:** `apps/mobile/src/componentes/Partida.tsx`; estados de conta/jogador; `apps/api/src/aluno.ts`.

**Critério de conclusão:** interrupções em cada etapa não deixam recompensa sem resultado, resultado sem recompensa ou fila perdida; retomar não duplica operações. Implementar em conjunto com P0-02 e P0-03.

### P1-07 — Aplicar autorização e regras de planejamento no servidor

- [ ] Revalidar vínculos atuais ao publicar/recolher atividades, e não apenas a autoria.
- [ ] Revisar todas as mutações de planos e atividades após desvinculação ou encerramento de turma.
- [ ] Impedir registro de aula futura no servidor conforme RN-25.
- [ ] Preservar os testes de autorização já existentes e acrescentar casos de escrita.

**Referências:** `apps/api/src/professor.ts`; `packages/core/src/planejamento.ts`; `apps/web/app/professor/(painel)/planejamento/acoes.ts`.

**Critério de conclusão:** um professor desvinculado não altera a distribuição para turmas sem permissão; requisição direta não contorna a data permitida para registro da aula.

### P1-08 — Tornar a auditoria confiável diante de falhas

- [ ] Definir quais ações sensíveis exigem registro obrigatório.
- [ ] Associar alteração e registro na mesma transação, ou usar mecanismo durável equivalente.
- [ ] Cobrir as operações previstas no PRD e no ADR 0019, incluindo entradas e alterações relevantes.
- [ ] Substituir o simples aviso no console por recuperação e acompanhamento de falhas.

**Problema:** `registrar` captura a falha e deixa a operação principal continuar; uma ação pode terminar sem trilha de auditoria.

**Referência:** `apps/api/src/infra.ts`. MOD-ADM-009 e MOD-SEG-012.

**Critério de conclusão:** falha de auditoria não resulta em ação sensível definitivamente concluída sem registro recuperável. Testar falha deliberada em base isolada.

### P1-09 — Corrigir estados de envio e a ordem dos resultados

- [ ] Exibir confirmação de envio apenas após aceite do servidor.
- [ ] Diferenciar salvo localmente, pendente, enviando, enviado e recusado.
- [ ] Definir instante de execução e desempate estável para resultados do mesmo dia.

**Problemas:** a atividade pode anunciar envio concluído antes da confirmação; consultas de último resultado ordenam apenas pela data. O horário de recebimento não substitui necessariamente o de execução offline.

**Referências:** `apps/mobile/src/app/atividade/[id].tsx`; `apps/api/src/aluno.ts`; `apps/api/src/professor.ts`; modelo `Jogada` em `apps/api/prisma/schema.prisma`.

**Critério de conclusão:** com rede interrompida, não aparece sucesso de envio; duas execuções no mesmo dia têm ordem previsível, inclusive se sincronizadas fora de ordem.

### P1-10 — Completar as verificações automatizadas e a homologação

- [ ] Configurar lint web sem assistente interativo.
- [ ] Automatizar testes, typecheck, lint e build em integração contínua.
- [ ] Criar testes de integração em PostgreSQL isolado para migrações, rollback, concorrência e privilégios.
- [ ] Cobrir os cenários de sincronização e troca de conta identificados neste plano.
- [ ] Executar fluxo completo: cadastro → login → missão offline → reconexão → painel → relatório.

**Critério de conclusão:** pipeline reproduzível com saída zero e evidências de execução real das integrações críticas. Testes com banco simulado permanecem úteis, mas não substituem esses testes.

### P1-11 — Atualizar os PRDs e definir o compromisso do MVP

- [ ] Atualizar o PRD geral: administração e coordenação já têm implementação.
- [ ] Remover descrições antigas de ausência da API e do envio pelo app.
- [ ] Atualizar MOD-PER-008, pois a troca de senha já existe.
- [ ] Corrigir MOD-ATI-010 para parcial enquanto não houver estado em andamento.
- [ ] Separar histórico de jogadas implementado de histórico de avaliações ainda pendente.
- [ ] Alinhar PRD-03, matriz de permissões e ADR 0019 sobre admin e coordenação.
- [ ] Separar situação de implementação, evidência de verificação e aceite aprovado.
- [ ] Atualizar o inventário das suítes de testes.
- [ ] Decidir explicitamente o que é obrigatório na validação e o que permanece pós-MVP.

**Critério de conclusão:** cada requisito do MVP tem comportamento vigente, evidência ou pendência explícita e vínculo com o teste de aceite. Não marcar como aprovado apenas por existir código.

## P2 — Urgência média

### P2-01 — Completar o ciclo de atividades do professor

- [ ] Implementar data limite e exibição do prazo.
- [ ] Definir e implementar encerramento da atividade.
- [ ] Controlar edição de atividade publicada, preservando a interpretação dos resultados anteriores.
- [ ] Completar os dados do catálogo: formato, fases e mapa.

**Referências:** PRD-04 e PRD-14; MOD-MIS-013, MOD-ATI-001, MOD-ATI-005, MOD-ATI-007 e MOD-ATI-009.

**Aceite:** professor configura o ciclo completo e aluno vê prazos e estados coerentes; edição não muda silenciosamente o significado dos resultados históricos.

### P2-02 — Separar demonstração de progressão institucional

- [ ] Remover a liberação irrestrita dos mapas da configuração institucional padrão.
- [ ] Definir se a exceção será controlada pelo professor por turma.
- [ ] Manter uma opção explícita de demonstração, sem confundi-la com a regra normal.

**Referências:** `apps/mobile/src/estado/jogador.tsx`; `apps/mobile/src/app/(abas)/perfil.tsx`. MOD-GAM-001, RN-05 e MOD-ATI-011.

**Aceite:** a progressão segue a regra aprovada; a exceção é aplicada pelo ator autorizado. Antecipar este item se a progressão for parte obrigatória da validação.

### P2-03 — Implementar avaliação e feedback conforme o MVP

- [ ] Exibir detalhes pedagógicos da execução para o professor.
- [ ] Registrar avaliação e feedback, publicar para o aluno e manter histórico.
- [ ] Exibir o feedback recebido no aplicativo.

**Referências:** PRD-15 e MOD-ALU-005.

**Aceite:** professor avalia uma atividade concluída; somente o aluno destinatário vê o feedback; histórico permanece consultável. Se esse ciclo fizer parte da entrega prometida, subir para P1.

### P2-04 — Completar notificações e acompanhamento

- [ ] Definir central no app, leitura/não leitura e persistência dos estados.
- [ ] Implementar aviso de nova atividade e de avaliação publicada.
- [ ] Decidir se push e lembrete de prazo entram no MVP.

**Referência:** PRD-16.

**Aceite:** avisos são direcionados ao destinatário correto, não duplicam no reenvio e mantêm o estado de leitura. Push continua uma decisão de escopo.

### P2-05 — Melhorar administração e recuperação de acesso

- [ ] Implementar busca e filtros de equipe por nome, papel e situação.
- [ ] Implementar recuperação de senha por e-mail, se exigida no MVP.
- [ ] Planejar importação CSV somente conforme prioridade aprovada; atualmente é pós-MVP.
- [ ] Exibir erros administrativos junto aos campos, preservando validação no servidor.

**Referências:** MOD-ADM-004, MOD-ADM-008, MOD-AUT-007 e MOD-USA-010; `apps/web/components/escola/formulario.tsx`.

**Aceite:** filtros combinam corretamente; erros apontam o campo; recuperação não revela se o e-mail existe e usa token limitado e de uso único.

### P2-06 — Homologar acessibilidade e usabilidade

- [ ] Testar TalkBack e, se iOS estiver contratado, VoiceOver.
- [ ] Conferir rótulos e alternativas por toque em todos os jogos.
- [ ] Medir contraste e áreas de toque.
- [ ] Testar texto em 130%, telas pequenas e redução de movimento.
- [ ] Verificar geração, legibilidade e compartilhamento do relatório no aparelho.
- [ ] Executar testes de tarefa com alunos e professores, com evidências.

**Referências:** PRD-08, PRD-09 e requisitos USA/POR do PRD-17.

**Aceite:** registrar dispositivo, cenário, esperado, observado e correções. Falhas que impeçam um participante de usar o produto sobem para P1.

### P2-07 — Medir desempenho e reduzir consultas amplas

- [ ] Medir abertura do app, resposta a interação, jogos 3D, painel e PDF nas condições do PRD.
- [ ] Paginar listas longas e evitar carregar todo o histórico para telas que precisam de um recorte.
- [ ] Homologar navegadores previstos e definir evidência de disponibilidade.

**Referências:** MOD-DES-001 a MOD-DES-007, MOD-CMP-002 e MOD-CON-005.

**Aceite:** resultados medidos e comparados às metas, com base e aparelho de referência identificados. Não registrar metas como atendidas sem medição.

### P2-08 — Validar conteúdo e interpretação pedagógica

- [ ] Revisar correspondência das missões com habilidades BNCC.
- [ ] Resolver a diversidade de formatos do mapa 5 ou aprovar formalmente a exceção.
- [ ] Validar pesos de domínio, metas SMART e linguagem das recomendações.
- [ ] Explicitar diferenças entre os critérios exibidos para professor e coordenação.

**Referências:** MOD-ADF-002, MOD-ADF-004, PRD-11 e pendências do PRD geral.

**Aceite:** revisão pedagógica registrada, sem apresentar tendências de desempenho como diagnóstico ou estilo fixo de aprendizagem.

### P2-09 — Definir retenção, exportação e exclusão de dados

- [ ] Definir retenção do histórico e fluxo de atendimento aos responsáveis.
- [ ] Implementar exportação e exclusão conforme as decisões institucionais aplicáveis.
- [ ] Resolver a diferença entre desativação operacional e exclusão efetiva.
- [ ] Documentar o efeito de apagar progresso local quando existe cópia sincronizada.

**Referências:** MOD-SEG-011, MOD-PER-007 e PRD-10.

**Aceite:** fluxo documentado e testado, com clareza sobre dados locais, servidor e registros preservados. Antecipar se exigido pelos responsáveis antes da validação.

## Sequência recomendada de execução

1. Resolver P0-01 a P0-03 em conjunto: identidade e persistência são a base da sincronização.
2. Resolver a build, os privilégios da auditoria e as condições de implantação: P0-04 a P0-06.
3. Implementar consistência transacional e validação dos dados: P1-04, P1-06, P1-07 e P1-08.
4. Corrigir indicadores e restaurar histórico: P1-01, P1-02, P1-03, P1-05 e P1-09.
5. Consolidar verificações e atualizar documentação: P1-10 e P1-11. Criar os testes de regressão junto de cada correção, sem esperar esta etapa.
6. Executar os itens P2 obrigatórios no MVP; manter os demais no backlog com decisão explícita.

## Critérios para liberar uma validação institucional

- [ ] Todos os P0 resolvidos e verificados.
- [ ] Nenhuma mistura de dados entre alunos nos cenários de troca de conta.
- [ ] Nenhuma perda ou duplicação nos cenários offline e entre aparelhos definidos.
- [ ] Indicadores usam unidades corretas e têm limitações explícitas.
- [ ] Autorizações verificadas também nas operações de escrita.
- [ ] Auditoria protegida e recuperável diante de falhas.
- [ ] Build, lint, typecheck e testes aprovados na versão candidata.
- [ ] Fluxo completo homologado com PostgreSQL real e celular.
- [ ] Pendências institucionais e escopo do MVP aprovados pelos responsáveis.
- [ ] Requisitos ainda parciais ou não medidos registrados sem alegação de conformidade completa.

## Modelo de evidência por item

Copiar este bloco para cada ação concluída:

```text
Item:
Responsável:
Commit/versão:
Data:
Requisito/PRD:
Mudança realizada:
Cenário e ambiente de teste:
Resultado esperado:
Resultado observado:
Evidência (teste/log/captura sem segredos):
Limitações remanescentes:
Situação: pendente | em execução | implementado | verificado
```

**Decisão recomendada:** concentrar o próximo ciclo em integridade dos dados e entrega verificável. Aumentar o número de funcionalidades antes dessas correções ampliaria o volume de dados e fluxos afetados pelos problemas atuais.
