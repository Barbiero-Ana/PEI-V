import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import type { AvisoAluno, Questao, ResultadoJogada } from "@modolume/core";
import { ErroApi, chamarApi, semConexao, temApi } from "@/lib/api";
import { normalizar, svgDoRosto } from "@/componentes/Rosto";
import { useJogador, type ProgressoServidor, type Recompensa } from "./jogador";
import { useIdentidade } from "./identidade";
import { receberNoEscopo, type ContaAluno, type OperacaoAluno } from "./isolamento";
export type { ContaAluno } from "./isolamento";

/**
 * Ligação do app com o servidor (API do Modolume):
 * - a conta do aluno na turma (entrada com o código da turma, sem e-mail);
 * - a fila de jogadas: toda missão ou atividade concluída entra na fila e é
 *   enviada quando houver internet, sem perder nada (ADR 0003, MOD-HIS-005);
 * - o avatar, enviado sempre que muda, para o professor ver o mesmo rosto;
 * - o progresso de gamificação (estrelas, pontos, constelações, desafios e
 *   compras), guardado no banco: em outro aparelho, o aluno recupera tudo;
 * - as atividades que o professor enviou para a turma (com cópia no aparelho).
 */

export interface AtividadeDoProfessor {
  publicacaoId?: string;
  publicacaoNumero?: number;
  id: string;
  titulo: string;
  formato: "objetiva" | "completar" | "associacao-visual" | "sequencia" | "pronta";
  instrucao: string;
  habilidade: string;
  missaoId: string;
  questoes: Questao[];
  liberarEm: string;
  prazo?: string;
  encerrada?: boolean;
  feita: { percentualAcerto: number; estrelas: number; data: string } | null;
}

export interface DevolutivaAluno {
  id: string;
  feedback: string;
  percepcao: string | null;
  criadaEm: string;
  atividadeId: string | null;
  atividade: { titulo: string };
  professor: { nome: string };
}

export interface JogadaParaEnviar extends ResultadoJogada {
  publicacaoId?: string | null;
  id: string;
  recompensar?: boolean;
  motivoRecusa?: string;
  alunoId: string;
  origem: "mapa" | "professor";
  atividadeId: string | null;
  titulo: string;
}
type DestinoJogada = { origem: "mapa" | "professor"; titulo: string; atividadeId?: string; publicacaoId?: string };

interface Guardado {
  inicios: Record<string, { atividadeId: string; publicacaoId?: string; iniciadaEm: string }>;
  avisos: AvisoAluno[];
  avaliacoes: DevolutivaAluno[];
  leiturasPendentes: string[];
  fila: JogadaParaEnviar[];
  recusadas: JogadaParaEnviar[];
  atividades: AtividadeDoProfessor[];
  /** Atividades feitas neste aparelho (aparecem como feitas mesmo antes de enviar). */
  feitas: Record<string, { percentualAcerto: number; estrelas: number; data: string; publicacaoId?: string }>;
  /** Último avatar enviado (para só reenviar quando mudar). */
  avatarEnviado: string;
  /** O aluno escolheu usar o app sem entrar numa turma (só no aparelho). */
  semTurma: boolean;
  /** Último progresso enviado (para só reenviar quando mudar). */
  progressoEnviado: string;
}

const VAZIO: Guardado = {
  inicios: {},
  avisos: [],
  avaliacoes: [],
  leiturasPendentes: [],
  fila: [],
  recusadas: [],
  atividades: [],
  feitas: {},
  avatarEnviado: "",
  semTurma: false,
  progressoEnviado: "",
};

/** Resposta ao código pessoal do aluno: quem é e se ainda precisa criar o PIN (ADR 0017). */
export type IdentificacaoAluno = {
  primeiroNome: string;
  turma: string;
  criarPin: boolean;
};

interface Estado {
  pronto: boolean;
  /** O app tem servidor configurado (EXPO_PUBLIC_API_URL). */
  temServidor: boolean;
  conta: ContaAluno | null;
  semTurma: boolean;
  /** Usar o app só no aparelho, sem turma (pode entrar depois pelo Perfil). */
  continuarSemTurma: () => void;
  /** Jogadas ainda não enviadas ao servidor. */
  pendentes: number;
  recusadas: number;
  resultadosRecusados: JogadaParaEnviar[];
  /** Resultado da última tentativa de falar com o servidor. */
  online: boolean | null;
  atividades: AtividadeDoProfessor[];
  avisos: AvisoAluno[];
  avaliacoes: DevolutivaAluno[];
  iniciarAtividade: (id: string, publicacaoId?: string) => Promise<void>;
  marcarAvisosLidos: (ids: string[]) => void;
  carregandoAtividades: boolean;
  estadoAtividades: "aguardando" | "atualizadas" | "erro";
  /** Primeiro passo: o código pessoal que o professor ou a coordenação passou. */
  identificar: (codigo: string) => Promise<IdentificacaoAluno>;
  /** Segundo passo: o PIN de 4 números (no primeiro acesso, o PIN enviado é o que o aluno criou). */
  entrar: (codigo: string, pin: string) => Promise<void>;
  sairDaTurma: () => void;
  /** Coloca a jogada na fila do servidor (e tenta enviar na hora). */
  registrarJogada: (r: ResultadoJogada, destino: DestinoJogada) => Promise<void>;
  concluirMissao: (r: ResultadoJogada, destino: DestinoJogada) => Promise<Recompensa>;
  atualizarAtividades: () => Promise<void>;
  sincronizar: () => Promise<void>;
}

const Ctx = createContext<Estado | null>(null);

const novoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function ProvedorConta({ children }: { children: ReactNode }) {
  const { conta: contaDaIdentidade, escopo, repositorio, selecionar, falhar } = useIdentidade();
  const {
    jogador,
    perfilLocal,
    importarPerfil,
    pronto: jogadorPronto,
    movimentos,
    comprasPendentes,
    capturarProgresso,
    conciliar,
    importarProgresso,
    prepararResultado,
    aplicarSnapshot,
  } = useJogador();
  const retrato = useMemo(() => ({ movimentos, comprasPendentes }), [movimentos, comprasPendentes]);
  const [pronto, setPronto] = useState(false);
  const [g, setG] = useState<Guardado>(VAZIO);
  const atual = useRef<Guardado>(VAZIO);
  const [online, setOnline] = useState<boolean | null>(null);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);
  const [estadoAtividades, setEstadoAtividades] = useState<Estado["estadoAtividades"]>("aguardando");
  const buscandoAtividades = useRef(false);
  const enviando = useRef(false);
  const montado = useRef(false);
  const login = useRef(0);
  const rostoAtual = jogador?.rosto;

  useEffect(() => {
    montado.current = true;
    repositorio
      .dados<Guardado>("conta", escopo.identidade, async () => ({
        ...VAZIO,
        fila: contaDaIdentidade ? await repositorio.filaLegada<JogadaParaEnviar>(contaDaIdentidade.aluno.id) : [],
      }))
      .then((dados) => {
        if (!montado.current || !escopo.ativa()) return;
        const lido = { ...VAZIO, ...dados };
        atual.current = lido;
        setG(lido);
        setPronto(true);
      })
      .catch(() => {
        if (montado.current && escopo.ativa()) falhar();
      });
    return () => {
      montado.current = false;
    };
  }, [contaDaIdentidade, escopo, repositorio, falhar]);

  const gravar = useCallback(
    (mudar: (g: Guardado) => Guardado) => {
      if (!montado.current || !escopo.ativa()) return;
      const novo = mudar(atual.current);
      atual.current = novo;
      setG(novo);
      void repositorio.salvar("conta", escopo.identidade, novo).catch(() => {
        if (montado.current && escopo.ativa()) falhar();
      });
    },
    [escopo, repositorio, falhar],
  );

  const capturar = useCallback(
    () => (pronto && jogadorPronto ? escopo.capturar(contaDaIdentidade, () => montado.current) : null),
    [escopo, pronto, jogadorPronto, contaDaIdentidade],
  );

  /** Token recusado pelo servidor: sai da turma, mas guarda a fila para quando entrar de novo. */
  const tratarErro = useCallback(
    (e: unknown, sessao: OperacaoAluno) => {
      if (!sessao.ativa()) return;
      if (semConexao(e)) setOnline(false);
      else if (e instanceof ErroApi && (e.status === 401 || e.status === 403)) {
        void selecionar(null).catch(() => {});
      }
    },
    [selecionar],
  );

  const sincronizar = useCallback(async () => {
    const sessao = capturar();
    if (!temApi || !sessao || enviando.current) return;
    const s = atual.current;
    enviando.current = true;
    try {
      try {
        await repositorio.aguardarEscritas();
      } catch {
        if (sessao.ativa()) falhar();
        return;
      }
      if (!sessao.ativa()) return;
      const minhas = s.fila.filter((j) => j.alunoId === sessao.alunoId);
      for (let i = 0; i < Math.max(1, minhas.length); i += 100) {
        const jogadorCapturado = capturarProgresso();
        const resposta = await chamarApi<{
          recebidas: string[];
          recusadas: string[];
          motivosRecusa: Record<string, string>;
          comprasRecusadas: string[];
          iniciosConfirmados: string[];
          iniciosRecusados: string[];
          progresso: ProgressoServidor;
        }>("/aluno/sincronizar", {
          token: sessao.token,
          metodo: "POST",
          corpo: {
            dispositivoId: jogadorCapturado.dispositivoId,
            legado: jogadorCapturado.legado,
            inicios: Object.values(atual.current.inicios).slice(0, 100),
            jogadas: minhas.slice(i, i + 100).map(({ alunoId: _alunoId, ...j }) => j),
            compras: jogadorCapturado.comprasPendentes,
          },
        });
        if (!sessao.ativa()) return;
        const removidas = new Set([...resposta.recebidas, ...resposta.recusadas]);
        const novoJogador = conciliar(resposta.progresso, resposta.recusadas, resposta.comprasRecusadas, true);
        const novo = {
          ...atual.current,
          inicios: Object.fromEntries(
            Object.entries(atual.current.inicios).filter(
              ([id]) => ![...resposta.iniciosConfirmados, ...resposta.iniciosRecusados].includes(id),
            ),
          ),
          fila: atual.current.fila.filter((j) => !removidas.has(j.id)),
          recusadas: [
            ...atual.current.recusadas,
            ...atual.current.fila
              .filter((j) => resposta.recusadas.includes(j.id))
              .map((j) => ({ ...j, motivoRecusa: resposta.motivosRecusa[j.id] })),
          ],
        };
        const escrita = repositorio.salvarJuntos(escopo.identidade, novoJogador, novo);
        aplicarSnapshot(novoJogador);
        atual.current = novo;
        setG(novo);
        await escrita;
      }
      if (!sessao.ativa()) return;
      if (atual.current.leiturasPendentes.length) {
        const ids = atual.current.leiturasPendentes.slice(0, 500);
        await chamarApi("/aluno/avisos/lidos", { token: sessao.token, metodo: "POST", corpo: { ids } });
        if (!sessao.ativa()) return;
        gravar((x) => ({ ...x, leiturasPendentes: x.leiturasPendentes.filter((id) => !ids.includes(id)) }));
      }
      // Sessões antigas não trazem avatar: não enviar o padrão sobre o remoto.
      if (!perfilLocal) {
        await receberNoEscopo(
          sessao,
          (token) => chamarApi<{ aluno: { nome: string; avatar: { rosto?: object } | null } }>("/aluno/eu", { token }),
          ({ aluno }) => importarPerfil({ nome: aluno.nome, rosto: aluno.avatar?.rosto }),
        );
        return; // O novo perfil dispara o próximo envio, com o retrato atualizado.
      }
      const rostoCapturado = capturarProgresso().jogador?.rosto;
      // avatar: só quando mudou desde o último envio
      if (rostoCapturado) {
        const rosto = normalizar(rostoCapturado);
        const svg = svgDoRosto(rosto, 96);
        if (svg !== atual.current.avatarEnviado) {
          await chamarApi("/aluno/eu", { token: sessao.token, metodo: "PATCH", corpo: { avatar: { rosto, svg } } });
          if (!sessao.ativa()) return;
          gravar((x) => ({ ...x, avatarEnviado: svg }));
        }
      }
      setOnline(true);
    } catch (e) {
      tratarErro(e, sessao);
    } finally {
      enviando.current = false;
    }
  }, [
    capturar,
    gravar,
    tratarErro,
    perfilLocal,
    importarPerfil,
    repositorio,
    falhar,
    capturarProgresso,
    conciliar,
    aplicarSnapshot,
    escopo,
  ]);

  const guardarJogada = useCallback(
    async (r: ResultadoJogada, destino: DestinoJogada, resultado?: ReturnType<typeof prepararResultado>) => {
      if (!montado.current || !escopo.ativa()) return;
      const s = atual.current;
      if (contaDaIdentidade && !capturar()) return;
      const jogada = contaDaIdentidade && {
        ...r,
        dicas: r.dicas ?? 0,
        id: r.id ?? novoId(),
        recompensar: !!resultado,
        alunoId: contaDaIdentidade.aluno.id,
        origem: destino.origem,
        atividadeId: destino.atividadeId ?? null,
        publicacaoId: destino.publicacaoId ?? null,
        titulo: destino.titulo,
      };
      if (!jogada && !resultado) return;
      const novo = jogada
        ? {
            ...s,
            fila: [...s.fila, jogada],
            feitas: destino.atividadeId
              ? {
                  ...s.feitas,
                  [destino.atividadeId]: {
                    percentualAcerto: r.percentualAcerto,
                    estrelas: r.estrelas,
                    data: r.data,
                    publicacaoId: destino.publicacaoId,
                  },
                }
              : s.feitas,
          }
        : s;

      try {
        const novoJogador = resultado?.novo ?? {
          ...capturarProgresso(),
          resultados: [...capturarProgresso().resultados, { ...r, id: jogada ? jogada.id : r.id }],
        };
        const escrita = repositorio.salvarJuntos(escopo.identidade, novoJogador, novo);
        aplicarSnapshot(novoJogador);
        atual.current = novo;
        setG(novo);
        await escrita;
      } catch (erro) {
        if (montado.current && escopo.ativa()) falhar();
        throw erro;
      }
      if (jogada && escopo.ativa()) setTimeout(sincronizar, 0);
    },
    [aplicarSnapshot, capturar, capturarProgresso, contaDaIdentidade, escopo, falhar, repositorio, sincronizar],
  );

  /** Traz o progresso guardado no servidor (de outros aparelhos) e junta com o daqui. */
  const trazerProgresso = useCallback(async () => {
    const sessao = capturar();
    if (!temApi || !sessao) return;
    try {
      await receberNoEscopo(
        sessao,
        (token) => chamarApi<ProgressoServidor>("/aluno/progresso", { token }),
        importarProgresso,
      );
    } catch (e) {
      tratarErro(e, sessao);
    }
  }, [capturar, importarProgresso, tratarErro]);

  const atualizarAtividades = useCallback(async () => {
    const sessao = capturar();
    if (!temApi || !sessao || buscandoAtividades.current) return;
    buscandoAtividades.current = true;
    setCarregandoAtividades(true);
    try {
      await receberNoEscopo(
        sessao,
        async (token) => {
          const [a, n, f] = await Promise.all([
            chamarApi<{ atividades: AtividadeDoProfessor[] }>("/aluno/atividades", { token }),
            chamarApi<{ avisos: AvisoAluno[] }>("/aluno/avisos", { token }),
            chamarApi<{ avaliacoes: DevolutivaAluno[] }>("/aluno/avaliacoes", { token }),
          ]);
          return { ...a, ...n, ...f };
        },
        ({ atividades, avisos, avaliacoes }) => {
          if (!Array.isArray(atividades)) throw new ErroApi(502, "O servidor não retornou a lista de atividades.");
          gravar((x) => ({
            ...x,
            atividades,
            avisos: avisos.map((a) => ({
              ...a,
              lida:
                a.lida ||
                x.avisos.some((anterior) => anterior.id === a.id && anterior.lida) ||
                x.leiturasPendentes.includes(a.id),
            })),
            avaliacoes,
          }));
          setEstadoAtividades("atualizadas");
          setOnline(true);
        },
      );
    } catch (e) {
      if (sessao.ativa()) setEstadoAtividades("erro");
      tratarErro(e, sessao);
    } finally {
      buscandoAtividades.current = false;
      if (sessao.ativa()) setCarregandoAtividades(false);
    }
  }, [capturar, gravar, tratarErro]);

  // envia o que ficou pendente: ao abrir, ao voltar para o app e a cada minuto
  useEffect(() => {
    if (!pronto || !jogadorPronto) return;
    const primeira = setTimeout(() => {
      trazerProgresso().then(sincronizar);
      atualizarAtividades();
    }, 0);
    const ao = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        trazerProgresso().then(sincronizar);
        atualizarAtividades();
      }
    });
    const tic = setInterval(() => {
      void sincronizar().then(atualizarAtividades);
    }, 60_000);
    return () => {
      clearTimeout(primeira);
      ao.remove();
      clearInterval(tic);
    };
  }, [pronto, jogadorPronto, sincronizar, atualizarAtividades, trazerProgresso, contaDaIdentidade?.token]);

  // avatar ou progresso mudaram no app: manda para o servidor (com um pequeno atraso,
  // para juntar várias mudanças seguidas num envio só)
  useEffect(() => {
    if (!pronto || !contaDaIdentidade) return;
    const envio = setTimeout(sincronizar, 1500);
    return () => clearTimeout(envio);
  }, [rostoAtual, retrato, pronto, contaDaIdentidade, sincronizar]);

  const iniciarAtividade = useCallback(
    async (id: string, publicacaoId?: string) => {
      if (!contaDaIdentidade || !publicacaoId || atual.current.inicios[publicacaoId]) return;
      gravar((x) => ({
        ...x,
        inicios: {
          ...x.inicios,
          [publicacaoId]: { atividadeId: id, publicacaoId, iniciadaEm: new Date().toISOString() },
        },
      }));
      await repositorio.aguardarEscritas();
      if (escopo.ativa()) setTimeout(sincronizar, 0);
    },
    [contaDaIdentidade, gravar, repositorio, escopo, sincronizar],
  );
  const marcarAvisosLidos = useCallback(
    (ids: string[]) => {
      gravar((x) => ({
        ...x,
        avisos: x.avisos.map((a) => ({ ...a, lida: a.lida || ids.includes(a.id) })),
        leiturasPendentes: [...new Set([...x.leiturasPendentes, ...ids])],
      }));
      setTimeout(sincronizar, 0);
    },
    [gravar, sincronizar],
  );

  const valor = useMemo<Estado>(
    () => ({
      pronto: pronto && jogadorPronto,
      temServidor: temApi,
      conta: contaDaIdentidade,
      semTurma: g.semTurma,
      continuarSemTurma: () => gravar((x) => ({ ...x, semTurma: true })),
      pendentes: contaDaIdentidade ? g.fila.filter((j) => j.alunoId === contaDaIdentidade.aluno.id).length : 0,
      recusadas: g.recusadas.length,
      resultadosRecusados: g.recusadas,
      online,
      avisos: g.avisos,
      avaliacoes: g.avaliacoes,
      iniciarAtividade,
      marcarAvisosLidos,
      carregandoAtividades,
      estadoAtividades,
      atividades: g.atividades.map((a) => ({
        ...a,
        feita: g.feitas[a.id]?.publicacaoId === a.publicacaoId ? (g.feitas[a.id] ?? a.feita) : a.feita,
      })),
      identificar: (codigo) =>
        chamarApi<IdentificacaoAluno>("/auth/aluno/codigo", { metodo: "POST", corpo: { codigo } }),
      entrar: async (codigo, pin) => {
        const tentativa = ++login.current;
        const r = await chamarApi<{
          token: string;
          aluno: { id: string; nome: string; avatar: { rosto?: object; svg?: string } | null };
          turma: ContaAluno["turma"];
        }>("/auth/aluno", { metodo: "POST", corpo: { codigo, pin } });
        if (!escopo.ativa() || !montado.current || tentativa !== login.current) return;
        // O estado do jogador só será carregado DEPOIS da seleção da identidade.
        await selecionar({ token: r.token, aluno: r.aluno, turma: r.turma });
      },
      sairDaTurma: () => {
        if (escopo.ativa()) void selecionar(null).catch(() => {});
      },
      registrarJogada: (r, destino) => guardarJogada(r, destino),
      concluirMissao: async (r, destino) => {
        const identificada = { ...r, id: novoId() };
        const resultado = prepararResultado(identificada);
        await guardarJogada(identificada, destino, resultado);
        return resultado.recompensa;
      },
      atualizarAtividades,
      sincronizar,
    }),
    [
      pronto,
      g,
      contaDaIdentidade,
      online,
      carregandoAtividades,
      estadoAtividades,
      atualizarAtividades,
      sincronizar,
      guardarJogada,
      prepararResultado,
      escopo,
      selecionar,
      gravar,
      jogadorPronto,
      iniciarAtividade,
      marcarAvisosLidos,
    ],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useConta(): Estado {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConta precisa estar dentro de <ProvedorConta>.");
  return ctx;
}
