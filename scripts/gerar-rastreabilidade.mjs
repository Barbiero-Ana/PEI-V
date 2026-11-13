import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origem = resolve(raiz, "docs/02-modulos");
const destino = resolve(raiz, "docs/08-engenharia");
const modulos = {
  "01": [
    "Equipe e aluno autenticam por canais diferentes. As guardas consultam papel, vínculo e versão da sessão no banco.",
    "apps/api/src/acesso.ts apps/api/src/infra.ts apps/web/app/entrar apps/web/app/redefinir-senha apps/mobile/src/app/entrar.tsx",
    "professor, aluno, turma, registro",
    "senha-provisoria.test.ts, ciclo-aluno.test.ts e verificar-banco.ts. Entrega pelo Resend e comportamento em aparelho real aguardam homologação.",
  ],
  "02": [
    "Administrador gerencia a própria escola. A lista filtra nome, perfil e situação antes de paginar. A pessoa define sua credencial pelo e-mail.",
    "apps/api/src/admin.ts apps/web/app/admin/usuarios apps/web/app/admin/registros",
    "instituicao, professor, turma, aluno, registro",
    "papel-equipe.test.ts e verificar-banco.ts. Importação CSV e homologação visual dos formulários pendentes.",
  ],
  "03": [
    "Administração cadastra turmas e alunos. Coordenação gerencia vínculos docentes. Encerrar uma turma invalida o acesso dos alunos.",
    "apps/api/src/admin.ts apps/api/src/coordenacao.ts apps/api/src/professor.ts apps/web/app/admin/turmas apps/web/app/coordenacao/vinculos",
    "turma, professor_turma, aluno",
    "ciclo-aluno.test.ts e leitura-professor.test.ts. Homologar cadastro e vínculos pela interface.",
  ],
  "04": [
    "Catálogo define fases e formatos. A partida registra acertos de primeira, tentativas e fases com dica.",
    "packages/core/src/missoes.ts apps/mobile/src/componentes/Partida.tsx apps/api/src/jogada.ts",
    "missao, mapa, formato_atividade, jogada",
    "missoes.test.ts e jogada.test.ts. Validar cada jogo no aparelho e revisar BNCC com a equipe pedagógica.",
  ],
  "05": [
    "As regras de luzes e constelações ficam no núcleo. A loja e a projeção offline ficam no estado do jogador.",
    "packages/core/src/constelacoes.ts apps/mobile/src/estado/jogador.tsx apps/mobile/src/app/loja.tsx apps/api/src/aluno.ts",
    "ponto_mapa, progresso_missao, constelacao_conquistada, desafio_concluido, compra_loja",
    "progresso.test.ts e verificar-consolidacao.ts cobrem soma, bônus, compras concorrentes e saldo. Aceite em aparelhos pendente.",
  ],
  "06": [
    "A navegação do aluno apresenta mapas, conquistas, perfil e atividades da turma em abas.",
    "apps/mobile/src/app/(abas) apps/mobile/src/componentes/BarraAbas.tsx",
    "missao, mapa, jogada",
    "Início mostra a devolutiva publicada e acesso aos avisos. Teste de tarefa e acessibilidade em celular pendentes.",
  ],
  "07": [
    "Aluno configura avatar e preferências no app. A equipe consulta a conta e altera a própria senha pela web.",
    "apps/mobile/src/app/(abas)/perfil.tsx apps/mobile/src/estado/jogador.tsx apps/web/app/conta/senha apps/api/src/acesso.ts",
    "aluno, avatar_aluno, compra_loja, professor",
    "senha-provisoria.test.ts cobre troca de senha na API. Preferências e avatar exigem testes em aparelho.",
  ],
  "08": [
    "Tamanho de texto, contraste, fonte, voz e movimento são preferências locais aplicadas na interface.",
    "apps/mobile/src/app/acessibilidade.tsx apps/mobile/src/estado/acessibilidade.tsx apps/mobile/src/lib/acessibilidadeSalva.ts",
    "Preferências locais do dispositivo",
    "Medições, TalkBack e prévias por opção pendentes.",
  ],
  "09": [
    "O app gera PDF A4 a partir do progresso disponível localmente e abre o compartilhamento do sistema.",
    "apps/mobile/src/app/relatorio.tsx apps/mobile/src/lib/relatorioPdf.ts",
    "Histórico local e progresso da conta",
    "Histórico remoto é restaurado para a análise. Geração, compartilhamento e tempo no aparelho pendentes.",
  ],
  10: [
    "A fila é separada por aluno. A API retorna confirmações por ID e o app guarda recusas separadas de pendências.",
    "apps/mobile/src/estado/conta.tsx apps/mobile/src/estado/isolamento.ts apps/mobile/src/estado/progresso-local.ts apps/api/src/sincronizacao-aluno.ts apps/api/src/progresso-aluno.ts",
    "jogada e tabelas de progresso",
    "progresso-local.test.ts cobre conciliação, resposta antiga e migração do histórico. verificar-consolidacao.ts cobre transação, soma, compras, saldo e rollback. Homologação em aparelhos pendente.",
  ],
  11: [
    "App e painel usam o domínio do núcleo com medidas originais e ordenação estável. O painel agrupa formatos por jeito e identifica separadamente o acerto médio.",
    "packages/core/src/aprendizagem.ts apps/web/lib/painel/pentagrama.ts apps/web/lib/painel/dados.ts",
    "jogada, formato_atividade",
    "aprendizagem.test.ts e aprendizagem-painel.test.ts cobrem domínio, adaptação e recência. Conferência visual entre interfaces pendente.",
  ],
  12: [
    "A web recorta dados por professor e turma, calcula indicadores e apresenta agenda, alertas e filtros.",
    "apps/web/app/professor/(painel) apps/web/lib/painel/dados.ts packages/core/src/indicadores-smart.ts apps/api/src/professor.ts",
    "professor_turma, jogada, plano_aula, atividade_professor",
    "indicadores-smart.test.ts e leitura-professor.test.ts. Medições de usabilidade e decisões sobre os denominadores pendentes.",
  ],
  13: [
    "Professor cria e acompanha planos das turmas vinculadas. A API protege vínculos, data e registro da aula.",
    "apps/web/app/professor/(painel)/planejamento packages/core/src/planejamento.ts apps/api/src/professor.ts",
    "plano_aula, plano_habilidade, plano_formato, plano_missao, plano_aluno_foco",
    "escrita-professor.test.ts e validacao.test.ts. Revisar datas e fluxo completo pela web.",
  ],
  14: [
    "Professor publica atividades com prazo opcional. O painel distingue início e conclusão e abre a avaliação individual.",
    "packages/core/src/atividades-professor.ts apps/web/app/professor/(painel)/atividades apps/api/src/professor.ts apps/api/src/aluno.ts",
    "atividade_professor, atividade_turma, questao_atividade, opcao_questao, jogada",
    "verificar-consolidacao.ts valida início, prazo, encerramento e reenvio. Homologação dos formatos no aparelho pendente.",
  ],
  15: [
    "Professor consulta fases e salva versões de avaliação. Rascunhos são privados; a publicação libera a devolutiva e o aviso ao aluno.",
    "apps/api/src/avaliacoes.ts apps/web/app/professor/(painel)/atividades apps/mobile/src/app/feedback",
    "jogada, avaliacao_atividade, registro",
    "verificar-consolidacao.ts cobre privacidade, publicação, histórico, imutabilidade no banco e preservação ao excluir a atividade. Aceite em aparelho pendente.",
  ],
  16: [
    "O app reúne avisos de atividade, prazo e avaliação. O sino do professor inclui avaliações pendentes.",
    "apps/api/src/avisos-aluno.ts apps/mobile/src/app/avisos.tsx apps/web/lib/painel/alertas.ts apps/web/components/painel/alertas.tsx",
    "Derivado de plano_aula, atividade_professor, avaliacao_atividade e jogada; leitura_aviso_aluno",
    "O aluno tem leitura persistida no banco e fila offline. O sino da equipe mantém lidos por conta/dia no navegador. Push e leitura da equipe entre aparelhos ficam fora desta entrega.",
  ],
  17: [
    "Requisitos transversais de segurança, qualidade, desempenho, interfaces e portabilidade.",
    "apps/api/src/infra.ts apps/api/prisma/schema.prisma apps/api/scripts/verificar-banco.ts apps/web/middleware.ts apps/mobile/src/estado/isolamento.ts packages/core",
    "Todas as entidades e dados locais",
    "Suítes do núcleo, API e app e verificação em PostgreSQL. Medições, validação institucional e ambiente real pendentes.",
  ],
};

const evidencias = {
  "ATI-005":
    "Prazo opcional no contrato, editor, API e CHECK no banco. verificar-consolidacao.ts cobre prazo e encerramento. Aceite visual pendente.",
  "ATI-010":
    "Primeiro início persistido e separado da entrega. Teste real confirma em andamento e concluída. Conferência em aparelho pendente.",
  "AVA-003":
    "Avaliação versionada com rascunho privado. Publicação exige texto; percepção usa a escala do PRD. Testes reais de persistência e autorização.",
  "AVA-005":
    "Somente avaliações publicadas são retornadas ao aluno. Teste real cobre ausência do rascunho e aviso de publicação.",
  "NOT-004":
    "Leitura do aluno é guardada no banco, com marcação individual/todos e fila offline. Leitura da equipe continua local ao navegador.",
  "MAN-003":
    "ESLint da API verifica regras e fronteiras além da tipagem. Workflow de CI executa lint, tipagem, testes, rastreabilidade, migrações, build web e bundle Android. Execução remota 43427120758 aprovada em 13/11/2026.",
  "AUT-007":
    "Uso único concorrente, expiração, resposta uniforme e contrato Resend simulado em verificar-banco.ts. Entrega real e análise do tempo de resposta pendentes.",
  "AUT-004":
    "senha-provisoria.test.ts, ciclo-aluno.test.ts, leitura-professor.test.ts e escrita-professor.test.ts exercitam recusas de papéis e vínculos específicos.",
  "AUT-008": "A API mantém as operações de código e PIN. Falta homologar recuperação do aluno no dispositivo.",
  "AUT-009":
    "codigo-acesso.test.ts cobre formato e compatibilidade. verificar-banco.ts valida PIN inicial único e bloqueio com cinco falhas concorrentes. Homologar a digitação e a colagem no aparelho.",
  "ADM-004":
    "Filtros combinados e paginação na página de usuários. validacao.test.ts verifica acentos e limites de página. Aceite da interface pendente.",
  "ADM-009":
    "verificar-banco.ts verifica o papel do banco e rollback da revogação de senha. Demais operações e consulta pela interface precisam de cobertura.",
  "ADM-010":
    "verificar-banco.ts cobre cadastro sem credencial na resposta e consumo único do link. A pessoa solicita o link em Recuperar acesso. Entrega real e convite automático no cadastro seguem pendentes.",
  "TUR-009": "leitura-professor.test.ts verifica recorte ao perder vínculo e quando turma encerra.",
  "HIS-005":
    "Suíte mobile cobre gravação conjunta da recompensa e da fila, reabertura e troca de identidade. verificar-banco.ts cobre reenvio e consulta do resultado pelo professor. Queda e reconexão em celular pendentes.",
  "HIS-006":
    "verificar-consolidacao.ts cobre ganhos distintos nas duas ordens, reenvio sem novo crédito, compras concorrentes e importação legada única. Aceite físico pendente.",
  "CON-002":
    "Conclusão local e fila são gravadas juntas. O protocolo novo grava histórico, crédito e compras na mesma transação da API. verificar-consolidacao.ts força falha no débito e confirma rollback de tudo.",
  "SEG-012": "verificar-banco.ts verifica privilégios efetivos e rollback de uma ação sensível no PostgreSQL local.",
  "SEG-006": "jogada.test.ts e validacao.test.ts exercitam incoerências no resultado e datas inválidas.",
  "PLA-004":
    "escrita-professor.test.ts confirma a recusa do registro futuro pela API. O fluxo pela interface fica pendente.",
  "APR-002":
    "aprendizagem-painel.test.ts verifica as mesmas medidas e domínio, com recência estável por data/ID. A UI mantém acerto médio identificado separadamente.",
  "PRF-008":
    "indicadores-smart.test.ts exercita cálculos em memória. Unidade de IND-06 e viés de IND-04 permanecem em revisão.",
};

const link = (arquivo, base) =>
  relative(base, arquivo)
    .split("\\")
    .join("/")
    .split("/")
    .map((parte) => encodeURIComponent(parte).replaceAll("(", "%28").replaceAll(")", "%29"))
    .join("/");
const escrever = (arquivo, texto) => writeFileSync(arquivo, `${texto.trim()}\n`, "utf8");
const tabela = (colunas) => colunas.map((coluna) => coluna.replaceAll("|", "\\|")).join(" | ");
const linhasMatriz = [];
const entradas = [];
const ids = new Set();
for (const nome of readdirSync(origem)
  .filter((nome) => /^PRD-\d+ /.test(nome))
  .sort()) {
  let prd = readFileSync(resolve(origem, nome), "utf8").replaceAll("\r\n", "\n");
  const numero = nome.slice(4, 6);
  const dataOrigem = prd.match(/^atualizado: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  if (!dataOrigem) throw new Error(`Data de origem ausente: ${nome}`);
  const dataRevisao = prd.match(/^revisao_documental: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  const responsavel = prd.match(/^responsavel_revisao: (.+)$/m)?.[1];
  const revisao =
    dataRevisao && responsavel
      ? `${dataRevisao.split("-").reverse().join("/")} — ${responsavel}. A aprovação da organização e rastreabilidade não substitui o aceite funcional.`
      : "Não registrada na fonte; não se infere data ou assinatura.";
  const historico = `**Data registrada no PRD de origem:** ${dataOrigem}. Preservada da fonte; não representa a criação desta ficha.\n\n**Revisão documental:** ${revisao}`;
  const pasta = resolve(destino, `prd-${numero}`);
  // Critérios copiados do PRD passam a viver duas pastas abaixo da fonte.
  prd = prd.replace(/\]\(([^)]+)\)/g, (trecho, endereco) => {
    if (/^[a-z]+:/i.test(endereco) || endereco.startsWith("#")) return trecho;
    const [caminho, ...fragmento] = endereco.split("#");
    return `](${link(resolve(origem, decodeURIComponent(caminho)), pasta)}${fragmento.length ? `#${fragmento.join("#")}` : ""})`;
  });
  mkdirSync(pasta, { recursive: true });
  const [objetivo, codigo, persistencia, teste] = modulos[numero];
  const titulo = nome.replace(/\.md$/, "");
  const fonte = link(resolve(origem, nome), pasta);
  const arquivos = codigo.split(" ");
  for (const arquivo of arquivos)
    if (!existsSync(resolve(raiz, arquivo))) throw new Error(`Referência ausente: ${arquivo}`);
  const referencias = arquivos.map((arquivo) => `- [${arquivo}](${link(resolve(raiz, arquivo), pasta)})`).join("\n");
  const regras = [...prd.matchAll(/^\| (RN-\d+) \| (.+?) \|$/gm)].map((m) => `- **${m[1]}** ${m[2]}`);
  const historias = [...prd.matchAll(/^\| (HU-[A-Z]+-\d+) \| (.+?) \| (.+?) \|$/gm)];
  const aceite = new Map(
    [...prd.matchAll(/^### (HU-[A-Z]+-\d+)[^\n]*\n([\s\S]*?)(?=^### |^## |(?![\s\S]))/gm)].map((m) => [
      m[1],
      m[2]
        .split(/\r?\n/)
        .filter((linha) => /^- \[[ x]\] CA-/.test(linha))
        .map((linha) => linha.replace(/^- \[[ x]\] /, "- ")),
    ]),
  );
  const lista = [];
  for (const linha of prd.split(/\r?\n/).filter((linha) => /^\| MOD-[A-Z]+-\d+ \|/.test(linha))) {
    const [id, descricao, prioridade = "—", verificacao = "—", situacao = "—"] = linha
      .trim()
      .slice(1, -1)
      .split("|")
      .map((valor) => valor.trim());
    if (ids.has(id)) throw new Error(`Requisito duplicado: ${id}`);
    ids.add(id);
    const sigla = id.replace(/^MOD-/, "");
    const historiasVinculadas = historias.filter((historia) => historia[3].includes(sigla));
    const criterios = historiasVinculadas.flatMap((historia) =>
      (aceite.get(historia[1]) ?? []).map((criterio) => `- **${historia[1]}** ${criterio.slice(2)}`),
    );
    const evidencia =
      evidencias[sigla] ??
      "Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.";
    const aceiteLocal =
      situacao === "Substituído" ? "Substituído no PRD" : evidencias[sigla] ? "Evidência parcial" : "Pendente";
    const arquivo = `${id.toLowerCase()}.md`;
    escrever(
      resolve(pasta, arquivo),
      `# PRD do requisito ${id}\n\n${historico}\n\n## Objetivo e escopo\n\n${descricao}\n\nOrigem: [${titulo}](${fonte}), seção 5. Prioridade **${prioridade}**, método **${verificacao}**. Situação declarada na origem **${situacao}**.\n\n[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).\n\n## Regras, histórias e critérios de aceite\n\n${historiasVinculadas.map((h) => `- ${h[1]} ${h[2]}`).join("\n") || "O PRD não mapeia uma história individual a este requisito."}\n\n${criterios.join("\n") || "Use a descrição da seção 5 como cenário de verificação. O PRD não associa um critério de aceite individual a este item."}\n\n${regras.length ? "As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD." : "Consulte as regras transversais no PRD-17."}\n\n## Implementação e evidência\n\n${referencias}\n\n**Aceite nesta auditoria** ${aceiteLocal}.\n\n${evidencia}`,
    );
    lista.push(`- [${id}](${arquivo}) ${descricao}`);
    linhasMatriz.push(
      `| ${tabela([`[${id}](prd-${numero}/${arquivo})`, `[PRD-${numero}](${link(resolve(origem, nome), destino)})`, `[${titulo.slice(9)}](prd-${numero}/README.md)`, situacao, historiasVinculadas.map((h) => h[1]).join(", ") || "Seção 5", aceiteLocal, evidencia])} |`,
    );
  }
  const perfis =
    prd.split("## 3. Usuários e necessidades")[1]?.split("\n## 4.")[0]?.trim() ?? "Consulte a matriz do PRD-17.";
  const dependencias = [...new Set((prd.split("## 12. Documentos vinculados")[1] ?? "").match(/PRD-\d{2}/g))];
  escrever(
    resolve(pasta, "README.md"),
    `# ${titulo}\n\n${historico}\n\n${objetivo}\n\n[PRD de origem](${fonte}) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)\n\n## Perfis e necessidades\n\n${perfis}\n\n## Implementação\n\n${referencias}\n\n**Persistência** ${persistencia}.\n\n## Regras de negócio\n\n${regras.join("\n") || "Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem."}\n\n## Testes e limites\n\n${teste}\n\n## Dependências\n\n${dependencias.map((prd) => `[${prd}](../${prd.toLowerCase()}/README.md)`).join(" · ") || "Veja o PRD de origem."}\n\n## Requisitos\n\n${lista.join("\n")}`,
  );
  entradas.push(`- [${titulo}](prd-${numero}/README.md) (${lista.length} requisitos)`);
}
escrever(
  resolve(destino, "matriz.md"),
  `# Matriz de rastreabilidade\n\n${ids.size} requisitos identificados nos 17 PRDs vigentes. Cada ficha reúne a descrição, os vínculos, os critérios da história e a evidência disponível. Critérios são da história e podem abranger mais de um requisito. O estado da origem reproduz o PRD e não equivale a aceite. Quando falta evidência específica, o aceite fica pendente.\n\n| Requisito | Origem | Módulo e arquivos | Estado no PRD | História / critério | Aceite local | Evidência e pendência |\n| --- | --- | --- | --- | --- | --- | --- |\n${linhasMatriz.join("\n")}`,
);
escrever(
  resolve(destino, "README.md"),
  `# Engenharia do Modolume\n\n- [Arquitetura e convenções](arquitetura.md)\n- [Relatório de auditoria](auditoria.md)\n- [Consolidação funcional e roteiro de implantação](consolidacao-funcional.md)\n- [Implantação de 13/11/2026](implantacao-2026-11-13.md)\n- [Plano de correção e testes do app](plano-correcao-mobile.md)\n- [Publicação na Google Play](publicacao-android.md)\n- [Matriz de rastreabilidade](matriz.md)\n\n## Módulos\n\n${entradas.join("\n")}\n\nRegere as fichas e a matriz com \`node scripts/gerar-rastreabilidade.mjs\`. Os PRDs em \`docs/02-modulos\` são a fonte dos critérios. As evidências e pendências são mantidas no gerador.`,
);
console.log(`${ids.size} requisitos em ${entradas.length} módulos.`);
