from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
import html

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf/Modolume_Roteiro_Documentacao_PRDs_e_Sistema.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='ArialBold', italic='Arial', boldItalic='ArialBold')
navy=colors.HexColor('#193650'); teal=colors.HexColor('#137C83')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Body',fontName='Arial',fontSize=10,leading=14,spaceAfter=9,textColor=navy))
styles.add(ParagraphStyle(name='TitleX',fontName='ArialBold',fontSize=25,leading=30,spaceAfter=16,textColor=navy))
styles.add(ParagraphStyle(name='Sub',fontName='ArialBold',fontSize=14,leading=18,spaceBefore=10,spaceAfter=10,textColor=teal))
styles.add(ParagraphStyle(name='QuoteX',fontName='Arial',fontSize=10.5,leading=15,leftIndent=12,rightIndent=10,spaceAfter=12,textColor=navy,borderColor=teal,borderWidth=1,borderPadding=9))
styles.add(ParagraphStyle(name='CellX',fontName='Arial',fontSize=8.5,leading=11,textColor=navy))
styles.add(ParagraphStyle(name='SmallX',fontName='Arial',fontSize=8,leading=11,spaceAfter=7,textColor=navy))
story=[]
def p(t,style='Body'): story.append(Paragraph(t,styles[style]))
def title(n,t): p(f'{n} / {t}','TitleX')
def sub(t): p(t,'Sub')
def quote(t): p(t,'QuoteX')
def table(rows,widths):
    data=[[Paragraph(str(c),styles['CellX']) for c in row] for row in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#DDEEF0')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),1,teal),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F4F7FA')])]))
    story.extend([t,Spacer(1,11)])
def page(): story.append(PageBreak())

p('MODOLOME' if False else 'MODOLUME','Sub')
p('Roteiro de apresentação<br/>Documentação, PRDs e sistema','TitleX')
p('Material de apoio para apresentação ao professor | 06/11/2026','SmallX')
p('Base da análise: commit <b>810bc46</b>, branch <b>feat/backend-guilherme</b>. Este PDF reúne o roteiro e as informações discutidas na revisão. Não representa uma nova homologação nem alteração do código.')
sub('1. Abertura: o que é o projeto')
quote('“O Modolume é um sistema educacional que conecta a prática de matemática do aluno ao acompanhamento do professor. O aluno utiliza um aplicativo com missões, atividades e gamificação. A equipe da escola utiliza um painel web para administrar usuários e turmas, acompanhar resultados, planejar aulas e distribuir atividades. O objetivo é transformar essa prática em informações que apoiem decisões pedagógicas. A proposta ainda precisa ser validada com usuários reais.”')
sub('Como usar este roteiro')
p('Os blocos entre aspas são sugestões de fala. As tabelas servem como apoio para responder perguntas. Abra os documentos e as telas correspondentes enquanto explica; evite apenas ler todos os PRDs.')
table([['Ordem','Conteúdo'],['1','Visão geral e organização da documentação'],['2','Estrutura dos PRDs e exemplo de rastreabilidade'],['3','Arquitetura, stacks e volume de código'],['4','Logins, dados e integração'],['5','Percentual estimado e qualidade das histórias de usuário']],[50,449])
sub('Parecer que deve acompanhar a apresentação')
p('<b>MVP em desenvolvimento e homologação.</b> Existem funcionalidades demonstráveis e testes aprovados, mas permanecem bloqueios de build, limitações de sincronização e validações práticas pendentes. “Implementado”, “testado” e “validado com usuários” são estados diferentes.')
page()

title('2','Organização da documentação')
quote('“A documentação está organizada por finalidade. Primeiro temos a visão do produto; depois, os requisitos de cada módulo; em seguida, decisões técnicas, diretrizes de interface e materiais de desenvolvimento. Essa divisão permite encontrar o que o sistema deve fazer e as razões das escolhas técnicas.”')
table([['Pasta','Finalidade'],['00-modelos','Modelos para manter a documentação padronizada.'],['01-produto','PRD geral: problema, público, objetivos, escopo e fases.'],['02-modulos','Os 17 PRDs que detalham as partes do sistema.'],['03-decisoes','ADRs: decisões de arquitetura e suas justificativas.'],['04-ux','Diretrizes de interface e usabilidade.'],['05-referencia','Contexto do projeto e modelo de dados.'],['06-desenvolvimento','Orientações técnicas, testes, auditorias e planos de ação.'],['07-historico','Registros históricos das entregas.'],['99-arquivo','Documentos substituídos, preservados para consulta.']],[115,384])
sub('Por que PRDs de módulo?')
quote('“A ADR 0014 registra a decisão de substituir a SRS centralizada por PRDs de módulo, conforme a orientação recebida do professor. Os identificadores dos requisitos foram preservados para manter a rastreabilidade.”')
sub('O papel de cada documento')
p('<b>PRD geral:</b> explica o produto e o problema. <b>PRD de módulo:</b> detalha o comportamento esperado. <b>ADR:</b> registra uma decisão técnica e suas razões. <b>Relatório de desenvolvimento:</b> registra o trabalho realizado. <b>Auditoria:</b> compara a proposta com as evidências atuais.')
p('Os links internos da documentação usam a sintaxe [[nome do documento]], do Obsidian. Prepare essa navegação antes da apresentação para evitar links que não abrem no visualizador escolhido.','SmallX')
page()

title('3','Estrutura dos PRDs')
quote('“Cada PRD começa explicando por que aquele módulo existe e para quem ele foi pensado. Depois descreve os comportamentos esperados, as histórias de usuário e as condições necessárias para aceitar a entrega. A história expressa a necessidade do usuário; o critério de aceite transforma essa necessidade em algo observável.”')
table([['Seção','Seção'],['1. Resumo executivo','7. Critérios de aceite'],['2. Problema e oportunidade','8. MVP e fases'],['3. Usuários e necessidades','9. Diretrizes do produto'],['4. Objetivos e critérios de sucesso','10. Dependências e riscos'],['5. Escopo, requisitos e regras','11. Pendências para aprovação'],['6. Histórias de usuário','12. Documentos vinculados']],[249,250])
table([['Campo','Legenda'],['Prioridade','E: essencial; I: importante; D: desejável.'],['Verificação','T: teste; D: demonstração; N: inspeção; A: análise ou medição.'],['Situação','Implementado, parcial, pendente ou a medir.']],[110,389])
sub('Exemplo para demonstrar ao professor')
quote('“No PRD-05, o requisito MOD-GAM-002 determina a atribuição de pontos. A história HU-GAM-01 explica que o aluno quer perceber seu avanço pela constelação. O critério HU-GAM-01 / CA-01 estabelece que uma missão de cinco fases, com quatro acertos de primeira, gera 12 pontos: 5 + 4 + 3. Podemos demonstrar o comportamento no aplicativo e conferir o teste da regra.”')
p('<b>Cadeia:</b> problema → requisito → história → critério de aceite → implementação → evidência.')
p('Use uma missão fora do bônus do desafio diário. O exemplo comprova uma regra local; não comprova a consolidação de pontos entre aparelhos. Números como CA-01 se repetem entre histórias: cite sempre também a HU.')
page()

title('4','Arquitetura e stacks')
quote('“O projeto usa um monorepositório: aplicações diferentes ficam no mesmo repositório e compartilham um núcleo de regras. Temos quatro partes principais: aplicativo mobile, aplicação web, API e núcleo compartilhado.”')
table([['Parte / local','Stack declarada','Responsabilidade'],['Mobile<br/>apps/mobile','React Native 0.86.3; React 19.2.3; Expo 57; Expo Router; TypeScript','Experiência do aluno, missões, perfil e dados locais.'],['Web<br/>apps/web','Next.js 15; React 19; Tailwind CSS 4; TypeScript','Site e painéis da equipe escolar.'],['API<br/>apps/api','NestJS 11; Prisma 6; Zod; JWT; bcrypt','Autenticação, autorização, validação e persistência.'],['Núcleo<br/>packages/core','TypeScript; Zod; Vitest','Regras, cálculos, tipos e conteúdos compartilhados.'],['Banco','PostgreSQL','Dados institucionais e registros persistentes.'],['Organização','pnpm; Turborepo','Dependências e execução das tarefas dos pacotes.']],[103,208,188])
p('As versões representam os manifests do projeto. Dependências declaradas com intervalos podem ter versões específicas diferentes no lockfile.','SmallX')
sub('Como as partes se relacionam')
quote('“O mobile e o painel se comunicam com a API, que controla o acesso ao banco. O core é compartilhado para reduzir duplicação das regras. Porém, compartilhar código não garante que todas as telas usem os mesmos indicadores corretamente; essa integração também precisa ser verificada.”')
p('<b>Fluxo de prática:</b> aluno → mobile → API → PostgreSQL → API → painel do professor.<br/><b>Fluxo de atividade:</b> professor → painel → API → PostgreSQL → API → mobile.')
page()

title('5','Volume de código')
quote('“Nesse recorte, o projeto possui aproximadamente 46 mil linhas distribuídas em 230 arquivos, com média de 201 linhas por arquivo. O aplicativo mobile concentra o maior volume. Essa contagem representa tamanho, não qualidade nem percentual de conclusão.”')
table([['Parte','Arquivos','Linhas','Média por arquivo'],['Mobile','87','23.311','268'],['Web','103','13.664','133'],['API','21','5.048','240'],['Core','19','4.166','219'],['Total','230','46.189','201']],[140,90,110,159])
sub('Como foi contado')
p('Foram contadas linhas físicas, incluindo comentários e linhas vazias, nos arquivos encontrados em apps e packages com extensões .ts, .tsx, .js, .mjs, .cjs, .css, .prisma e .sql. O recorte inclui testes e configurações nessas extensões. Exclui dependências, builds ignoradas, documentação e arquivos .d.ts.')
sub('A média não descreve todos os arquivos')
p('O arquivo packages/core/src/missoes.ts possui 1.677 linhas, incluindo conteúdo das missões. O editor web de atividades possui 796 linhas. Arquivos grandes merecem avaliação de responsabilidades, mas o tamanho, isoladamente, não comprova um problema.')
sub('Como responder se perguntarem sobre qualidade')
quote('“A qualidade é avaliada pelo comportamento correto, manutenção, testes, segurança e experiência do usuário. O número de linhas ajuda a mostrar a dimensão do projeto, mas não é nosso critério de qualidade.”')
page()

title('6','Logins e controle de acesso')
quote('“Existem dois fluxos principais de autenticação: um para a equipe escolar e outro para o aluno. A permissão depende do perfil, da instituição e dos vínculos. Estar autenticado não significa poder acessar qualquer turma.”')
table([['Público / condição','Funcionamento atual'],['Equipe escolar','Professor, coordenação e administrador entram com e-mail e senha. A API verifica o hash com bcrypt e emite JWT com validade de oito horas.'],['Senha provisória','A pessoa precisa trocar a senha para acessar as operações protegidas pelo bloqueio de senha provisória.'],['Aluno','Utiliza código pessoal de oito caracteres e PIN de quatro números.'],['Primeiro acesso do aluno','Se não existe PIN, o aluno define um. O servidor rejeita PINs considerados fracos.'],['Erros de PIN','Cinco erros consecutivos geram bloqueio de 15 minutos.'],['Sessão do aluno','Token com validade configurada de 180 dias; o servidor também verifica condições de acesso e versão da credencial.']],[128,371])
sub('Onde fica a sessão')
p('<b>Web:</b> cookie assinado e HttpOnly, que não pode ser lido pelo JavaScript da página. Com a API ligada, a sessão também contém o token usado pelo servidor web.')
p('<b>Mobile:</b> sessão e dados locais persistidos com AsyncStorage. O isolamento por aluno foi implementado recentemente. Esse armazenamento não deve ser apresentado como um cofre criptografado.')
sub('Recuperação de acesso')
p('Não apresente recuperação automática de senha por e-mail como concluída. O fluxo atual orienta procurar a escola, e há redefinição administrativa com senha provisória. No acesso do aluno, existe redefinição de credenciais conforme as permissões da equipe.')
page()

title('7','Dados e integração')
quote('“O aplicativo registra a prática localmente e possui uma fila para envio ao servidor. Com conexão e sessão válida, envia os dados à API. A API valida o acesso e grava no PostgreSQL. O painel consulta os dados disponíveis. No sentido contrário, o professor cria atividades e o aplicativo consulta as que são destinadas ao aluno.”')
table([['Integração','Situação'],['Web → API → banco','Implementada, com fluxos administrativos e pedagógicos.'],['Mobile → API','Implementada para autenticação, resultados, progresso e consulta de atividades.'],['Uso local / offline','Implementado; sincronização ainda precisa de consolidação.'],['Isolamento por aluno','Correção implementada e testes de auxiliares aprovados; falta validação completa em dispositivo.'],['Múltiplos aparelhos','Parcial: consolidação de ganhos e compras apresenta problemas.'],['Atividades → indicadores','Parcial: os caminhos de registro não alimentam todas as superfícies igualmente.'],['Avaliação, feedback e notificações','Não devem ser apresentados como um ciclo completo entregue.'],['Entrega de produção','Bloqueada pela falha de build web e pendências de estabilidade.']],[150,349])
sub('Como comprovar integração na apresentação')
p('O painel possui modo de demonstração quando API_URL não está configurada. Uma tela preenchida, sozinha, não comprova integração com o banco. Crie um registro e acompanhe sua persistência e leitura em outro ponto do sistema.')
p('No mobile, a configuração utiliza EXPO_PUBLIC_API_URL. O endereço precisa ser acessível pelo aparelho; localhost no telefone se refere ao próprio telefone.')
page()

title('8','Percentual e situação atual')
p('<b>Estimativa para comunicação: aproximadamente 70% de avanço funcional.</b> É um julgamento técnico sobre o escopo documentado, não uma medição oficial nem um percentual de prontidão para produção.')
quote('“Estimamos cerca de 70% de avanço funcional do escopo documentado. O sistema está em desenvolvimento e homologação. Essa estimativa não significa 70% de prontidão para produção: ainda temos bloqueios de build, sincronização e validação prática.”')
sub('O que sustenta essa estimativa')
p('Os componentes principais e diversos fluxos já existem. Na revisão anterior passaram 122 testes. Entretanto, existem módulos pendentes, integrações parciais e falhas importantes. A build web não concluiu e a validação com usuários reais permanece pendente.')
table([['Evidência da revisão','Resultado'],['API','63 testes passaram.'],['Core','43 testes passaram.'],['Mobile','16 testes passaram, com dependências simuladas.'],['Typecheck / lint mobile','Passaram.'],['Lint geral','Web solicita configuração interativa.'],['Build web','Falha no prerender de /404 e /_error, envolvendo useRef.']],[160,339])
sub('Percentual documental não é conclusão comprovada')
p('Os documentos classificam 166 de 223 requisitos ativos como implementados, aproximadamente <b>74,4%</b>. Os demais são 23 parciais, 19 pendentes e 15 a medir. Os requisitos têm pesos diferentes e alguns status estão desatualizados. Essa contagem não comprova atendimento integral.')
p('Não se atribui aqui um percentual preciso à prontidão de produção: faltam critérios formais de liberação e evidências para cada um. A homologação em PostgreSQL e a tentativa em iPhone descritas pela equipe não foram reproduzidas na revisão.','SmallX')
page()

title('9','Histórias de usuário')
p('<b>Os 17 PRDs de módulo possuem histórias e seções de critérios de aceite.</b> Foram identificadas 103 histórias ativas e uma substituída no PRD-03. Não é correto afirmar que todas estão corrigidas, aprovadas e comprovadas no sistema.')
quote('“Todos os módulos possuem histórias de usuário vinculadas a requisitos e critérios de aceite. Estamos revisando a precisão dos perfis, os benefícios esperados e a correspondência dos status com o código. A existência da história não significa que ela já foi implementada ou validada.”')
table([['Exemplo','Ajuste necessário'],['PRD-03: “Como gestão…”','Especificar administrador ou coordenação conforme a permissão real.'],['PRD-07: troca de senha','Atualizar o status para acompanhar a implementação.'],['PRD-10: outro aparelho','Explicitar benefício, limites e cenários de sincronização.'],['PRD-14: “quem está fazendo”','Alinhar requisito e aceite com a disponibilidade real do estado iniciado.'],['PRD-17: desempenho e uso','Definir condições de medição, dispositivos e critérios objetivos.']],[175,324])
sub('Exemplo de melhoria de redação')
p('<b>Atual:</b> “Como aluno, quero recuperar meu progresso em outro aparelho.”')
p('<b>Sugestão:</b> “Como aluno, quero recuperar meu progresso ao entrar em outro aparelho, para continuar meus estudos sem perder conquistas e atividades realizadas.”')
p('A redação melhora a história, mas não corrige a implementação. São necessários critérios para ganhos concorrentes, duplicação de envios, compras e recuperação do histórico. Histórias com objetivos distintos, como desligar vibração e apagar progresso, podem ser separadas para facilitar priorização e teste.')
p('As sugestões deste roteiro não alteraram os PRDs. Ausência da palavra “para” não torna uma história automaticamente inválida; o importante é que ator, necessidade e valor estejam claros e que o aceite seja verificável.','SmallX')
page()

title('10','Preparação para apresentar')
table([['Tempo','Demonstração sugerida'],['0–2 min','Problema, público e visão geral do produto.'],['2–4 min','Pastas da documentação, índice e ADR 0014.'],['4–7 min','PRD-05: requisito, história, aceite, regra e demonstração.'],['7–10 min','Arquitetura, login e criação/consulta de uma atividade.'],['10–12 min','Dados reais versus demonstração; integração e limites.'],['12–15 min','Percentual estimado, pendências e alinhamento com o professor.']],[75,424])
sub('Checklist do ensaio')
p('1. Abrir PRD geral, índice e PRDs escolhidos nos trechos corretos.<br/>2. Preparar contas e dados fictícios para demonstração.<br/>3. Confirmar API e conexão do aparelho antes de começar.<br/>4. Ensaiar um cenário permitido e um cenário recusado.<br/>5. Levar evidência dos testes, identificada pelo commit.<br/>6. Manter uma gravação de apoio, identificada como gravação.<br/>7. Explicar pendências sem apresentar metas como resultados medidos.')
sub('Perguntas para alinhar com o professor')
p('A divisão em módulos atende ao formato solicitado? Quais módulos são obrigatórios nesta entrega? Quais metas, amostras e instrumentos serão aceitos para validar usabilidade e resultados pedagógicos? Quem revisa e aprova os PRDs?')
sub('Referências utilizadas')
p('Repositório local Modolume, commit 810bc46: docs/README.md; PRD geral; PRDs 01 a 17; ADR 0014; package.json da raiz e dos quatro pacotes; apps/api/src/acesso.ts; apps/api/prisma/schema.prisma; arquivos de sessão web e estado mobile. Contagens realizadas nos arquivos locais.','SmallX')
p('Contexto complementar: Modolume_Guia_Ana_Git_Instalacao.md; Modolume_Relatorio_05-06_Nov_2026.docx; reverificação de 06/11/2026. As evidências executadas e as limitações foram preservadas neste roteiro.','SmallX')

def footer(c,doc):
    w,h=A4
    c.setStrokeColor(colors.HexColor('#D5DFE6')); c.line(48,42,w-48,42)
    c.setFont('Arial',8); c.setFillColor(navy)
    c.drawString(48,28,'MODOLUME | Roteiro de apresentação | 06/11/2026')
    c.drawRightString(w-48,28,str(doc.page))
doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=43,bottomMargin=56,title='Modolume - Documentação, PRDs e sistema',author='Equipe Modolume - roteiro de apoio')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
