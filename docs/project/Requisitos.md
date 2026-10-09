Modolume
Especificação de Requisitos de Software
Plataforma educacional de apoio à aprendizagem de Matemática.

Instituição: Centro Universitário de Várzea Grande (UNIVAG)
Disciplina: Projeto Extensionista Integrador IV
Professor orientador: Brendo Yuri Maia do Vale
Local e ano: Várzea Grande — MT, 2026
Equipe
- Ana Carolina da S. Barbiero
- Túlio F. Q. Dantas
- João Vitor dos Reis Leme Franco
- Guilherme Soares Nistal Sanches
- Yuri Zambrana A. de Magalhães
Sumário
- Visão geral
- 1. Introdução
- 2. Partes interessadas e usuários
- 3. Requisitos funcionais
- 4. Requisitos não funcionais
- 5. Requisitos de interface externa
- 6. Restrições de projeto
- 7. Verificação
- 8. Regras de negócio
- 9. Matriz de permissões por perfil
Visão geral
O Modolume é uma plataforma educacional projetada para apoiar a aprendizagem de Matemática e ampliar as possibilidades de acompanhamento pedagógico. Para o aluno, oferece um aplicativo móvel em que os conteúdos são apresentados como missões: minigames visuais e interativos construídos a partir de situações do dia a dia, organizados em mapas e acompanhados por um mascote, com dicas, retorno imediato, elementos de gamificação e recursos de acessibilidade. Para o professor, oferece uma plataforma web com gestão de turmas e atividades e com indicadores que mostram o desempenho dos alunos em diferentes formatos de atividade: em quais apresentam maior facilidade, quanto acertam de primeira, quanto utilizam as dicas e como evoluem ao longo do tempo.
1. Introdução
Propósito
Este documento apresenta os requisitos funcionais e não funcionais do Modolume e serve como referência para planejamento, desenvolvimento, elaboração de testes e avaliação acadêmica. Os requisitos poderão ser revisados a partir de futuras validações com escolas, professores e estudantes.
Escopo
O sistema é composto por dois produtos que compartilham as mesmas regras de negócio:
- Aplicativo do aluno (Android; iOS opcional): realização das missões de Matemática, gamificação, acompanhamento do próprio desenvolvimento, acessibilidade e relatório para a família.
- Plataforma web (professor, gestão e administração): gestão de usuários, turmas e atividades; avaliação e feedback; indicadores de aprendizagem por aluno e por turma.
Fora do escopo: outras disciplinas além de Matemática, troca de mensagens entre usuários, videoaulas e integração com sistemas acadêmicos externos, como diário de classe e boletim oficial.
Visão geral do produto
O aluno joga missões compostas por fases. Cada fase parte de uma situação do cotidiano e é resolvida por manipulação direta: arrastar, ligar, montar, girar ou encher. Ao final de cada missão, o sistema registra o resultado da jogada e o transforma em recompensa para o aluno e em informação para o professor. Os mesmos dados alimentam indicadores de desempenho por formato de atividade, representados em um radar de habilidades. Esses indicadores não constituem diagnóstico de estilo de aprendizagem.
Definições
Termo	Definição
Missão	Atividade jogável composta por fases, que trabalha um conteúdo com um formato de atividade.
Fase	Etapa de uma missão, com uma situação do dia a dia e uma tarefa.
Formato de atividade	Forma de interação da missão: associação visual, montagem, sequência, completar lacunas, manipulação, exploração 3D e questão objetiva.
Mapa	Conjunto ordenado de missões; equivale a um nível.
Pontos de luz	Pontuação obtida ao concluir missões.
Luzes	Pontos de luz disponíveis para troca na loja.
Constelação	Recompensa de um mapa, cujas estrelas acendem com os pontos de luz.
Desafio do dia	Missão sorteada pela data, igual para todos os alunos, com pontuação em dobro.
Dias de luz	Registro dos dias em que o aluno jogou.
Acerto de primeira	Fase resolvida sem nenhuma tentativa errada.
Autonomia	Proporção de fases resolvidas sem pedir dica.
Precisão	Medida baseada no número de tentativas por fase.
Domínio	Indicador de 0 a 100 calculado com base no acerto de primeira, na autonomia e na precisão em determinado formato de atividade.
Radar de habilidades	Gráfico polar que apresenta o domínio estimado do aluno por formato de atividade, conforme os registros disponíveis.
Mascote	Personagem (o axolote Lilo) que acompanha o aluno e reage às ações.


Convenções
- Verbo: “deve” indica requisito obrigatório; “pode” indica requisito opcional.
- Prioridade: E — Essencial; I — Importante; D — Desejável.
- Verificação: T — Teste; D — Demonstração; N — Inspeção; A — Análise.
2. Partes interessadas e usuários
Parte interessada	Descrição	Interação com o sistema
Aluno	Criança ou adolescente do Ensino Fundamental, com diferentes níveis de leitura e de familiaridade com a tecnologia.	Aplicativo móvel
Professor	Responsável pelas turmas, pelas atividades e pelo acompanhamento pedagógico.	Plataforma web
Diretora / Gestão	Responsável pela organização acadêmica: turmas e vínculos.	Plataforma web
Administrador	Responsável pelos usuários, perfis e configurações gerais.	Plataforma web
Família	Pais ou responsáveis que acompanham o aluno.	Relatório compartilhado (PDF)
Escola (potencial adotante)	Instituição de ensino que poderá contratar ou adotar a solução, participando da definição de responsabilidades pelo tratamento de dados.	Institucional


3. Requisitos funcionais
Autenticação e controle de acesso (AUT)
ID	Requisito	Prioridade	Verificação
MOD-AUT-001	O sistema deve permitir que usuários cadastrados se autentiquem com suas credenciais.	E	T
MOD-AUT-002	O sistema deve identificar o perfil do usuário após a autenticação.	E	T
MOD-AUT-003	O sistema deve direcionar o aluno ao aplicativo móvel e os demais perfis à plataforma web.	E	D
MOD-AUT-004	O sistema deve restringir telas, funções e operações conforme o perfil autenticado.	E	T
MOD-AUT-005	O sistema deve permitir que o usuário encerre sua sessão.	E	T
MOD-AUT-006	O sistema deve manter a sessão ativa entre aberturas do aplicativo enquanto a autenticação for válida.	E	T
MOD-AUT-007	O sistema deve permitir a redefinição de senha por e-mail para professor, gestão e administrador.	I	T
MOD-AUT-008	O sistema deve permitir que professor ou gestão redefinam o acesso de um aluno.	I	T
MOD-AUT-009	O sistema deve permitir que o aluno entre com o código da turma, escolhendo seu nome e avatar, sem uso de e-mail.	I	D


Administração de usuários (ADM)
ID	Requisito	Prioridade	Verificação
MOD-ADM-001	O administrador deve poder cadastrar usuários.	E	T
MOD-ADM-002	No cadastro, o administrador deve definir o perfil: administrador, gestão, professor ou aluno.	E	T
MOD-ADM-003	O administrador deve poder consultar os usuários cadastrados.	E	D
MOD-ADM-004	O administrador deve poder pesquisar usuários por nome, perfil e situação.	I	T
MOD-ADM-005	O administrador deve poder editar os dados cadastrais de um usuário.	E	T
MOD-ADM-006	O administrador deve poder ativar e desativar usuários, preservando o histórico.	E	T
MOD-ADM-007	A lista de usuários deve identificar usuários ativos e inativos por texto.	I	N
MOD-ADM-008	O administrador pode importar usuários a partir de planilha CSV.	D	T


Gestão de turmas (TUR)
ID	Requisito	Prioridade	Verificação
MOD-TUR-001	A gestão deve poder cadastrar turmas com nome, série, período e ano letivo.	E	T
MOD-TUR-002	A gestão deve poder editar e consultar turmas.	E	T
MOD-TUR-003	A gestão deve poder vincular um ou mais professores a uma turma.	E	T
MOD-TUR-004	A gestão deve poder vincular alunos a uma turma.	E	T
MOD-TUR-005	A gestão deve poder remover vínculos, preservando o histórico.	E	T
MOD-TUR-006	O sistema deve exibir os professores e alunos de cada turma.	E	D
MOD-TUR-007	O sistema deve identificar turmas ativas e encerradas.	I	D
MOD-TUR-008	O sistema deve gerar para cada turma um código de acesso, que pode ser renovado.	I	T
MOD-TUR-009	O professor deve visualizar somente as turmas às quais está vinculado.	E	T
MOD-TUR-010	O aluno deve acessar somente as informações da própria turma.	E	T


Atividades do professor (ATI)
ID	Requisito	Prioridade	Verificação
MOD-ATI-001	O sistema deve disponibilizar ao professor o catálogo de missões, com conteúdo, formato, número de fases e mapas.	E	D
MOD-ATI-002	O professor deve poder criar atividades compostas por uma ou mais missões do catálogo.	E	T
MOD-ATI-003	Toda atividade deve ter título; descrição e orientações são opcionais.	E	T
MOD-ATI-004	O professor deve selecionar as turmas que irão receber a atividade.	E	T
MOD-ATI-005	O professor deve poder definir data de início e data limite.	I	T
MOD-ATI-006	O sistema deve associar à atividade os formatos e habilidades das missões escolhidas.	I	T
MOD-ATI-007	O professor deve poder editar atividades em rascunho e o prazo de atividades publicadas.	E	T
MOD-ATI-008	O professor deve poder publicar a atividade para os alunos.	E	T
MOD-ATI-009	O sistema deve exibir a situação da atividade: rascunho, publicada ou encerrada.	E	D
MOD-ATI-010	O professor deve visualizar, por atividade, os alunos que concluíram, que estão em andamento e que não iniciaram.	E	D
MOD-ATI-011	O professor pode liberar todos os mapas de uma turma, dispensando a ordem de desbloqueio.	D	T


Missões do aluno (MIS)
ID	Requisito	Prioridade	Verificação
MOD-MIS-001	O sistema deve exibir ao aluno as missões organizadas em mapas e as atividades publicadas para a turma.	E	D
MOD-MIS-002	O sistema deve indicar a situação de cada missão: bloqueada, disponível, atual ou concluída, com as estrelas obtidas.	E	D
MOD-MIS-003	Cada fase deve apresentar uma situação do cotidiano e uma instrução curta da tarefa.	E	N
MOD-MIS-004	O aluno deve resolver as fases por manipulação direta dos elementos da tela.	E	D
MOD-MIS-005	Toda interação de arrastar deve ter uma alternativa por toque: tocar no item e depois no destino.	E	T
MOD-MIS-006	O aluno deve poder pedir uma dica em qualquer fase.	E	T
MOD-MIS-007	O sistema deve informar acerto ou erro imediatamente após a conferência da resposta.	E	T
MOD-MIS-008	Em caso de erro, o sistema deve explicar o que aconteceu e permitir nova tentativa.	E	T
MOD-MIS-009	Ao fim da missão, o sistema deve registrar formato, fases, acertos de primeira, tentativas, tempo, dicas, percentual de acerto e estrelas.	E	T
MOD-MIS-010	O sistema deve exibir ao fim da missão as estrelas, os pontos de luz ganhos, o avanço da constelação e o resumo da jogada.	E	D
MOD-MIS-011	A tela de resultado deve oferecer as opções jogar de novo, voltar e seguir para a próxima missão.	I	D
MOD-MIS-012	O aluno deve poder sair de uma missão a qualquer momento; a saída antecipada não deve registrar a missão como concluída nem conceder recompensas.	I	T
MOD-MIS-013	O sistema deve exibir o prazo das atividades publicadas pelo professor.	I	D


Gamificação (GAM)
ID	Requisito	Prioridade	Verificação
MOD-GAM-001	O sistema deve liberar cada mapa quando o anterior for concluído.	E	T
MOD-GAM-002	O sistema deve atribuir pontos de luz a cada missão concluída, conforme a regra RN-02.	E	T
MOD-GAM-003	O sistema deve acender as estrelas da constelação do mapa conforme as regras RN-03 e RN-04.	E	T
MOD-GAM-004	O sistema deve manter um álbum de constelações, com explicação, meses de visibilidade no céu do Brasil e curiosidades.	I	D
MOD-GAM-005	O sistema deve selecionar diariamente um desafio do dia, conforme a regra RN-11.	I	T
MOD-GAM-006	O sistema deve registrar e exibir em calendário os dias em que o aluno jogou, sem punição por dias sem jogar.	I	D
MOD-GAM-007	O sistema deve conceder conquistas por marcos de progresso, mostrando quanto falta para cada uma.	I	D
MOD-GAM-008	O aluno pode trocar luzes por itens do avatar e capas do perfil; itens comprados ficam liberados permanentemente.	D	T
MOD-GAM-009	O mascote deve reagir ao contexto (acerto, erro, dica e comemoração) e evoluir conforme as estrelas acesas.	I	D
MOD-GAM-010	No primeiro acesso, o sistema deve apresentar o mascote, o céu e os mapas, com opção de pular.	I	D
MOD-GAM-011	O sistema não deve exibir classificação (ranking) entre alunos.	I	N


Análise de aprendizagem (APR)
ID	Requisito	Prioridade	Verificação
MOD-APR-001	O sistema deve associar cada missão a um formato de atividade e a um ou mais conteúdos.	E	N
MOD-APR-002	O sistema deve calcular, para cada formato jogado, o acerto de primeira, a autonomia, a precisão e o domínio, conforme a regra RN-07.	E	T
MOD-APR-003	O sistema deve classificar cada formato em nível e tendência, conforme a regra RN-08.	E	T
MOD-APR-004	O sistema deve destacar o formato de atividade de melhor desempenho do aluno somente nas condições da regra RN-09, sem classificá-lo como estilo fixo de aprendizagem.	E	T
MOD-APR-005	O sistema deve representar o domínio em um radar de habilidades, com um eixo por formato.	E	D
MOD-APR-006	O sistema deve atualizar o radar e os indicadores a cada nova jogada ou avaliação.	E	T
MOD-APR-007	O sistema deve exibir ao aluno o formato de melhor desempenho, os resultados por formato experimentado, os formatos ainda não experimentados e uma missão sugerida.	I	D
MOD-APR-008	O sistema deve exibir ao professor o radar e os indicadores de cada aluno e o consolidado da turma.	E	D
MOD-APR-009	O sistema deve exibir a evolução do acerto ao longo dos meses.	I	D


Avaliação e feedback (AVA)
ID	Requisito	Prioridade	Verificação
MOD-AVA-001	O professor deve visualizar as atividades concluídas pelos alunos.	E	D
MOD-AVA-002	O professor deve visualizar o detalhe de cada aluno: fases, tentativas, tempo e dicas por missão.	E	D
MOD-AVA-003	O professor deve poder registrar uma avaliação e um feedback escrito.	I	T
MOD-AVA-004	O professor pode registrar sua percepção do desempenho nas habilidades da atividade.	D	T
MOD-AVA-005	O professor deve poder concluir a avaliação, tornando o feedback visível ao aluno.	I	T
MOD-AVA-006	O sistema deve manter o histórico das avaliações.	I	T


Painel do professor (PRF)
ID	Requisito	Prioridade	Verificação
MOD-PRF-001	O painel deve exibir as turmas do professor com número de alunos ativos e acerto médio.	E	D
MOD-PRF-002	O painel deve exibir acerto médio, conclusão e tentativas por formato de atividade.	E	D
MOD-PRF-003	O painel deve listar os alunos com acerto médio, quantidade de atividades, tendência e formato de destaque.	E	D
MOD-PRF-004	O painel deve exibir as atividades publicadas recentemente.	I	D
MOD-PRF-005	O painel deve indicar avaliações pendentes e alunos sem atividade recente.	I	D
MOD-PRF-006	O painel deve indicar as missões e formatos com maior uso de dicas.	I	D
MOD-PRF-007	O painel pode oferecer atalhos para criar atividade e abrir turmas.	D	D


Experiência do aluno (ALU)
ID	Requisito	Prioridade	Verificação
MOD-ALU-001	A tela inicial deve exibir nome e avatar, luzes, o céu do mapa atual, as próximas missões e o desafio do dia.	E	D
MOD-ALU-002	O sistema deve destacar a próxima missão recomendada, que abre com um toque.	E	D
MOD-ALU-003	O sistema deve exibir todos os mapas em forma de trilha, indicando missões concluídas, atual e bloqueadas.	E	D
MOD-ALU-004	O sistema deve reunir em uma tela as conquistas, os dias de luz e a análise de aprendizagem.	I	D
MOD-ALU-005	A tela inicial deve exibir os feedbacks recentes do professor.	I	D
MOD-ALU-006	O aluno deve consultar as missões já realizadas e as estrelas obtidas.	I	D


Perfil e personalização (PER)
ID	Requisito	Prioridade	Verificação
MOD-PER-001	O usuário deve visualizar seus dados principais e seu perfil de acesso.	E	D
MOD-PER-002	O aluno deve poder alterar nome e avatar.	E	T
MOD-PER-003	O aluno deve poder montar o avatar com rosto, cabelo, cores e acessórios.	I	D
MOD-PER-004	O aluno pode escolher uma capa animada para o perfil, gratuita ou comprada com luzes.	D	D
MOD-PER-005	O perfil deve exibir as constelações de todos os mapas e as estrelas acesas em cada uma.	I	D
MOD-PER-006	O aluno deve ser capaz de ligar e desligar a vibração.	I	T
MOD-PER-007	O aluno pode remover os dados locais de progresso do aparelho, mediante confirmação, sem excluir automaticamente o histórico sincronizado no servidor.	D	T
MOD-PER-008	Usuários com senha devem poder alterá-la.	I	T


Acessibilidade (ACE)
ID	Requisito	Prioridade	Verificação
MOD-ACE-001	O aluno deve poder escolher o tamanho do texto: normal, grande ou muito grande.	E	T
MOD-ACE-002	O aluno deve poder ativar a leitura em voz de enunciados, dicas, retornos e títulos, com opção de ouvir de novo.	E	T
MOD-ACE-003	O aluno deve poder usar uma fonte de leitura facilitada para dislexia.	I	T
MOD-ACE-004	O aluno deve poder ativar o alto contraste, aplicado sem reiniciar o aplicativo e sem sair da tela atual.	E	T
MOD-ACE-005	O aluno deve poder reduzir as animações; o sistema deve também respeitar a redução de movimento configurada no aparelho.	E	T
MOD-ACE-006	Todos os elementos interativos devem ter rótulos para leitores de tela.	I	N
MOD-ACE-007	A tela de acessibilidade pode exibir uma pré-visualização do efeito de cada opção.	D	D


Relatório para a família (REL)
ID	Requisito	Prioridade	Verificação
MOD-REL-001	O sistema deve gerar um relatório semanal com missões jogadas, estrelas, dias de luz, constelações e evolução do mascote.	I	D
MOD-REL-002	O relatório deve poder ser exportado em PDF, no formato A4.	I	T
MOD-REL-003	O PDF deve poder ser compartilhado pelos aplicativos do aparelho.	I	D


Notificações (NOT)
ID	Requisito	Prioridade	Verificação
MOD-NOT-001	O sistema deve avisar o aluno quando uma atividade for publicada para sua turma.	I	T
MOD-NOT-002	O sistema deve avisar o aluno quando uma atividade for avaliada.	I	T
MOD-NOT-003	O sistema pode lembrar o aluno de atividades com prazo próximo.	D	T
MOD-NOT-004	O sistema deve oferecer uma central de notificações, distinguindo lidas e não lidas.	I	D
MOD-NOT-005	O sistema pode avisar o professor sobre avaliações pendentes.	D	T


Histórico e sincronização (HIS)
ID	Requisito	Prioridade	Verificação
MOD-HIS-001	O sistema deve manter o histórico de jogadas e avaliações de cada aluno.	E	T
MOD-HIS-002	O professor deve consultar o histórico dos alunos das suas turmas.	E	D
MOD-HIS-003	O aluno deve consultar o próprio histórico.	I	D
MOD-HIS-004	As missões devem poder ser jogadas sem conexão com a internet, com o progresso salvo no aparelho.	E	T
MOD-HIS-005	As jogadas feitas sem conexão devem ser enviadas ao servidor quando a conexão for restabelecida.	E	T
MOD-HIS-006	Ao entrar em outro aparelho, o aluno deve recuperar seu progresso.	I	T


4. Requisitos não funcionais
Adequação funcional (ADF)
ID	Requisito	Prioridade	Verificação
MOD-ADF-001	O cálculo de pontos, estrelas, constelações e domínio deve produzir o mesmo resultado no aplicativo e na plataforma web.	E	T
MOD-ADF-002	Cada missão deve indicar o conteúdo de Matemática trabalhado, alinhado à BNCC.	E	N
MOD-ADF-003	Os mapas devem apresentar progressão pedagógica compatível com o ano escolar, contemplando conteúdos que vão do reconhecimento de quantidades a funções, probabilidade, média e ordem das operações, conforme a etapa atendida.	E	N
MOD-ADF-004	Cada mapa deve conter pelo menos dois formatos de atividade diferentes.	I	N


Eficiência de desempenho (DES)
ID	Requisito	Prioridade	Verificação
MOD-DES-001	O aplicativo deve exibir a tela inicial em até 3 segundos após a abertura, em aparelho de categoria intermediária.	I	T
MOD-DES-002	O retorno visual a toques e arrastes deve ocorrer em até 100 milissegundos.	E	T
MOD-DES-003	Animações e jogos devem ser exibidos a no mínimo 30 quadros por segundo.	I	T
MOD-DES-004	Consultas da plataforma web devem responder em até 2 segundos em condições normais de uso.	I	T
MOD-DES-005	O painel do professor deve carregar em até 3 segundos para uma turma de até 40 alunos.	I	T
MOD-DES-006	O relatório em PDF deve ser gerado em até 5 segundos.	D	T
MOD-DES-007	Listas com mais de 20 registros devem ser paginadas.	I	N


Compatibilidade (CMP)
ID	Requisito	Prioridade	Verificação
MOD-CMP-001	O aplicativo deve funcionar nas versões de Android e iOS oficialmente suportadas pela versão do React Native e do Expo adotada no projeto, conforme matriz de compatibilidade documentada.	E	T
MOD-CMP-002	A plataforma web deve funcionar nas duas versões mais recentes de Chrome, Edge, Firefox e Safari.	E	T
MOD-CMP-003	O aplicativo e a plataforma web devem trocar dados por uma interface única de serviços.	E	N


Usabilidade (USA)
ID	Requisito	Prioridade	Verificação
MOD-USA-001	Textos destinados ao aluno devem usar linguagem simples, sem termos técnicos.	E	N
MOD-USA-002	Um aluno sem experiência prévia deve concluir a primeira missão sem ajuda de um adulto.	I	T
MOD-USA-003	Qualquer missão deve poder ser iniciada em no máximo 2 toques a partir da tela inicial.	I	T
MOD-USA-004	Uma atividade deve poder ser criada e publicada pelo professor em até 5 passos.	I	T
MOD-USA-005	Os botões de ação dos jogos devem ficar fixos no rodapé, na mesma posição em todas as missões.	I	N
MOD-USA-006	Ao soltar um objeto arrastado, o destino deve ser reconhecido pelo centro do objeto, com tolerância mínima de 18 pontos.	I	T
MOD-USA-007	Erros não devem retirar pontos já obtidos, e o retorno de erro deve ter tom encorajador.	E	N
MOD-USA-008	Toda operação deve exibir retorno de carregamento, sucesso, aviso ou erro.	E	N
MOD-USA-009	Listas vazias devem exibir uma mensagem que oriente o usuário.	I	N
MOD-USA-010	Formulários devem validar os campos obrigatórios antes de salvar, com mensagem junto ao campo.	E	T
MOD-USA-011	Operações críticas, como desativar usuário ou apagar progresso, devem pedir confirmação.	E	T
MOD-USA-012	Animações de interface devem durar no máximo 1,5 segundo, exceto as de comemoração.	I	N
MOD-USA-013	O texto do aplicativo deve usar contraste mínimo de 4,5:1 no modo de alto contraste.	E	A
MOD-USA-014	Elementos tocáveis devem ter área mínima de 44 × 44 pontos.	E	N
MOD-USA-015	Estados como certo, errado, bloqueado e concluído não devem ser indicados apenas por cor.	E	N
MOD-USA-016	O layout não deve cortar textos com o tamanho de texto em 130%.	I	T
MOD-USA-017	Os enunciados das fases devem ter tamanho mínimo de 19 pontos no tamanho de texto normal.	I	N


Confiabilidade (CON)
ID	Requisito	Prioridade	Verificação
MOD-CON-001	Falhas de comunicação não devem fechar o aplicativo nem causar perda de progresso.	E	T
MOD-CON-002	O registro do resultado e a atualização dos pontos devem ocorrer de forma atômica.	E	T
MOD-CON-003	Um mesmo resultado não deve ser registrado mais de uma vez no servidor.	I	T
MOD-CON-004	Dados salvos por versões anteriores do aplicativo devem continuar legíveis após atualizações.	I	T


Segurança (SEG)
ID	Requisito	Prioridade	Verificação
MOD-SEG-001	As senhas devem ser armazenadas com função de hash adaptativa, nunca em texto simples.	E	N
MOD-SEG-002	As sessões devem usar tokens com expiração, guardados em área segura do dispositivo.	E	N
MOD-SEG-003	Toda operação restrita deve ter a permissão verificada no servidor.	E	T
MOD-SEG-004	Cada perfil deve acessar somente os dados e funções necessários à sua atividade.	E	T
MOD-SEG-005	Toda comunicação em produção deve usar HTTPS.	E	N
MOD-SEG-006	Os dados recebidos devem ser validados no servidor antes de serem gravados.	E	T
MOD-SEG-007	O aluno deve visualizar somente as próprias avaliações e dados.	E	T
MOD-SEG-008	O tratamento de dados de crianças e adolescentes deve observar a LGPD, especialmente o melhor interesse do titular, com definição documentada da base legal aplicável e dos procedimentos de autorização e transparência pertinentes.	E	N
MOD-SEG-009	O aplicativo do aluno deve limitar a coleta aos dados estritamente necessários à finalidade pedagógica, incluindo identificação mínima, vínculo com turma, avatar e registros de atividade.	E	N
MOD-SEG-010	O aplicativo não deve exibir publicidade nem compartilhar dados com terceiros para fins comerciais.	E	N
MOD-SEG-011	A escola deve poder exportar e excluir os dados de um aluno a pedido do responsável.	I	T


Manutenibilidade (MAN)
ID	Requisito	Prioridade	Verificação
MOD-MAN-001	As regras de negócio devem ficar em um núcleo compartilhado, separado das interfaces.	E	N
MOD-MAN-002	Novas missões devem poder ser incluídas como dados no catálogo, sem alteração das telas existentes.	I	N
MOD-MAN-003	O código deve seguir tipagem estática estrita e padrões automáticos de formatação e análise estática.	I	N
MOD-MAN-004	Componentes de interface com o mesmo comportamento devem ser reutilizados.	I	N
MOD-MAN-005	O código deve ser mantido em sistema de controle de versão.	E	N
MOD-MAN-006	Credenciais e endereços devem ser definidos por ambiente, fora do código-fonte.	E	N


Portabilidade (POR)
ID	Requisito	Prioridade	Verificação
MOD-POR-001	O aplicativo deve ser gerado a partir de um único código-fonte para Android e iOS.	I	N
MOD-POR-002	O aplicativo deve se adaptar a telas de 4,7 a 13 polegadas.	E	T
MOD-POR-003	A plataforma web deve se adaptar a larguras a partir de 768 pixels.	E	T
MOD-POR-004	O aplicativo deve poder ser instalado para validação sem depender das lojas oficiais.	I	D


5. Requisitos de interface externa
Interfaces de usuário
ID	Requisito	Prioridade	Verificação
MOD-IU-001	O aplicativo do aluno deve ter navegação inferior com as seções Início, Níveis, Conquistas e Perfil.	E	N
MOD-IU-002	As telas de jogo devem apresentar enunciado, botão de dica, área de interação e ações fixas no rodapé.	E	N
MOD-IU-003	A plataforma web deve ter navegação lateral, listas, formulários e painéis de indicadores.	E	N


Interfaces de hardware
ID	Requisito	Prioridade	Verificação
MOD-IH-001	O aplicativo deve usar a tela sensível ao toque para tocar, arrastar, girar e aproximar com dois dedos.	E	D
MOD-IH-002	O aplicativo deve usar a vibração e a saída de áudio do aparelho quando essas opções estiverem ligadas.	I	D


Interfaces de software
ID	Requisito	Prioridade	Verificação
MOD-IS-001	O sistema deve usar um serviço de back-end com autenticação, banco de dados relacional e controle de acesso por registro.	E	N
MOD-IS-002	O aplicativo deve usar a síntese de voz do sistema operacional, em português do Brasil.	E	D
MOD-IS-003	O aplicativo deve usar os recursos do sistema operacional para gerar e compartilhar arquivos PDF.	I	D


Interfaces de comunicação
ID	Requisito	Prioridade	Verificação
MOD-IC-001	A comunicação entre aplicativo, plataforma web e servidor deve usar HTTPS com TLS 1.2 ou superior.	E	N


6. Restrições de projeto
ID	Restrição
MOD-RES-001	O aplicativo do aluno deve ser desenvolvido em React Native, com Expo e TypeScript.
MOD-RES-002	A plataforma web deve ser desenvolvida em Next.js, com TypeScript.
MOD-RES-003	A interface deve seguir a identidade visual do Modolume: Poppins nos títulos, Inter no texto e Lexend como opção de leitura facilitada.
MOD-RES-004	O conteúdo pedagógico limita-se à Matemática do Ensino Fundamental, observando as habilidades pertinentes da BNCC.
MOD-RES-005	Os dados pessoais devem ser tratados conforme a LGPD e o Estatuto da Criança e do Adolescente.


7. Verificação
Cada requisito indica o método pelo qual será verificado:
Método	Aplicação
Teste (T)	Execução de casos de teste com entradas definidas e comparação com o resultado esperado.
Demonstração (D)	Execução da funcionalidade diante da escola ou da banca, observando o comportamento.
Inspeção (N)	Revisão do código, da interface ou do conteúdo, comparando com o requisito.
Análise (A)	Medição ou cálculo, como contraste de cores e disponibilidade.


8. Regras de negócio
ID	Regra
RN-01	Estrelas da missão: 3 estrelas com acerto de primeira de 90% ou mais; 2 estrelas com 60% ou mais; 1 estrela nos demais casos.
RN-02	Pontos de luz por missão: número de fases + acertos de primeira + 3.
RN-03	A cada 5 pontos de luz no mapa, uma estrela da constelação acende, até a penúltima.
RN-04	A última estrela acende somente quando todas as missões do mapa forem concluídas; a constelação completa vai para o álbum.
RN-05	Um mapa é liberado quando o anterior é concluído, salvo liberação feita pelo professor.
RN-06	Pedir dica não reduz pontos nem estrelas, mas é registrado e entra no cálculo da autonomia.
RN-07	Domínio do formato = 65% acerto de primeira + 20% autonomia + 15% precisão, considerando as 10 jogadas mais recentes do formato; no acerto de primeira, as jogadas recentes têm peso maior.
RN-08	Nível do formato: “vai muito bem” com domínio de 75 ou mais; “está crescendo” de 50 a 74; “vale treinar” abaixo de 50. A tendência é de subida ou queda quando a diferença entre a primeira e a segunda metade das jogadas é de pelo menos 12 pontos.
RN-09	O formato de melhor desempenho somente será destacado quando houver pelo menos 2 jogadas, 6 fases concluídas no formato e domínio igual ou superior a 60. Trata-se de um indicador de desempenho, não de uma classificação permanente do aluno.
RN-10	Itens e capas comprados com luzes ficam liberados permanentemente; as luzes gastas não são devolvidas.
RN-11	O desafio do dia deve ser definido pela data de referência do sistema e ser igual para os alunos elegíveis. A bonificação em dobro pode ser concedida apenas uma vez por aluno a cada data.


9. Matriz de permissões por perfil
Legenda: T — acesso total; P — acesso parcial ou restrito aos próprios dados ou às próprias turmas; — sem acesso.
Funcionalidade	Administrador	Gestão	Professor	Aluno
Usuários	T	—	—	—
Turmas e vínculos	T	T	P	P
Catálogo de missões	T	T	T	P
Atividades	—	P	T	P
Avaliação e feedback	—	P	T	P
Análise de aprendizagem	—	P	T	P
Painel de indicadores	—	T	T	—
Gamificação e personalização	—	—	—	T
Relatório para a família	—	—	P	T
Acessibilidade	T	T	T	T
Perfil e senha	T	T	T	T
Notificações	P	P	P	P
