import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import type { Questao, ResultadoJogada } from "@modolume/core";
import { ErroApi, chamarApi, semConexao, temApi } from "@/lib/api";
import { normalizar, svgDoRosto } from "@/componentes/Rosto";
import { useJogador, type ProgressoServidor } from "./jogador";
import { useIdentidade } from "./identidade";
import { receberNoEscopo, sincronizarFila, type ContaAluno, type OperacaoAluno } from "./isolamento";
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
  id: string;
  titulo: string;
  formato: "objetiva" | "completar" | "associacao-visual" | "sequencia" | "pronta";
  instrucao: string;
  habilidade: string;
  missaoId: string;
  questoes: Questao[];
  liberarEm: string;
  feita: { percentualAcerto: number; estrelas: number; data: string } | null;
}

export interface JogadaParaEnviar extends ResultadoJogada {
  id: string;
  alunoId: string;
  origem: "mapa" | "professor";
  atividadeId: string | null;
  titulo: string;
}

interface Guardado {
  conta: ContaAluno | null;
  fila: JogadaParaEnviar[];
  recusadas: JogadaParaEnviar[];
  atividades: AtividadeDoProfessor[];
  /** Atividades feitas neste aparelho (aparecem como feitas mesmo antes de enviar). */
  feitas: Record<string, { percentualAcerto: number; estrelas: number; data: string }>;
  /** Último avatar enviado (para só reenviar quando mudar). */
  avatarEnviado: string;
  /** O aluno escolheu usar o app sem entrar numa turma (só no aparelho). */
  semTurma: boolean;
  /** Último progresso enviado (para só reenviar quando mudar). */
  progressoEnviado: string;
}

const VAZIO: Guardado = {
  conta: null,
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
  /** Resultado da última tentativa de falar com o servidor. */
  online: boolean | null;
  atividades: AtividadeDoProfessor[];
  carregandoAtividades: boolean;
  /** Primeiro passo: o código pessoal que o professor ou a coordenação passou. */
  identificar: (codigo: string) => Promise<IdentificacaoAluno>;
  /** Segundo passo: o PIN de 4 números (no primeiro acesso, o PIN enviado é o que o aluno criou). */
  entrar: (codigo: string, pin: string) => Promise<void>;
  sairDaTurma: () => void;
  /** Coloca a jogada na fila do servidor (e tenta enviar na hora). */
  registrarJogada: (
    r: ResultadoJogada,
    extra: { origem: "mapa" | "professor"; titulo: string; atividadeId?: string },
  ) => void;
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
    progresso,
    pontosPorNivel,
    constelacoes,
    desafios,
    gastos,
    compras,
    importarProgresso,
  } = useJogador();
  // retrato do progresso do aparelho, no formato que o servidor guarda
  const retrato = useMemo<ProgressoServidor>(
    () => ({ progresso, pontosPorNivel, constelacoes, desafios, gastos, compras }),
    [progresso, pontosPorNivel, constelacoes, desafios, gastos, compras],
  );
  const retratoAtual = useRef(retrato);
  useEffect(() => {
    retratoAtual.current = retrato;
  }, [retrato]);
  const [pronto, setPronto] = useState(false);
  const [g, setG] = useState<Guardado>(VAZIO);
  const atual = useRef<Guardado>(VAZIO);
  const [online, setOnline] = useState<boolean | null>(null);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);
  const enviando = useRef(false);
  const montado = useRef(false);
  const login = useRef(0);
  const rostoAtual = jogador?.rosto;

  useEffect(() => {
    montado.current = true;
    repositorio
      .dados<Guardado>("conta", escopo.identidade, async () => ({
        ...VAZIO,
        conta: contaDaIdentidade,
        fila: contaDaIdentidade ? await repositorio.filaLegada<JogadaParaEnviar>(contaDaIdentidade.aluno.id) : [],
      }))
      .then((dados) => {
        if (!montado.current || !escopo.ativa()) return;
        // O token vigente vem da sessão, nunca de um snapshot antigo da conta.
        const lido = { ...VAZIO, ...dados, conta: contaDaIdentidade };
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
    () => (pronto && jogadorPronto ? escopo.capturar(atual.current.conta, () => montado.current) : null),
    [escopo, pronto, jogadorPronto],
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
    const s = atual.current;
    const sessao = capturar();
    if (!temApi || !sessao || enviando.current) return;
    // Retrato e avatar de A são capturados antes da primeira espera.
    const progressoCapturado = retratoAtual.current;
    const rostoCapturado = rostoAtual;
    enviando.current = true;
    try {
      await sincronizarFila(
        sessao,
        s.fila,
        (token, lote) =>
          chamarApi<{ recebidas: string[]; recusadas?: string[] }>("/aluno/jogadas", {
            token,
            metodo: "POST",
            corpo: { jogadas: lote },
          }),
        (ok, rejeitadas) =>
          gravar((x) => ({
            ...x,
            fila: x.fila.filter((j) => !ok.has(j.id) && !rejeitadas.has(j.id)),
            recusadas: [...x.recusadas, ...x.fila.filter((j) => rejeitadas.has(j.id))],
          })),
      );
      if (!sessao.ativa()) return;
      // Sessões antigas não trazem avatar: não enviar o padrão sobre o remoto.
      if (!perfilLocal) {
        await receberNoEscopo(
          sessao,
          (token) => chamarApi<{ aluno: { nome: string; avatar: { rosto?: object } | null } }>("/aluno/eu", { token }),
          ({ aluno }) => importarPerfil({ nome: aluno.nome, rosto: aluno.avatar?.rosto }),
        );
        return; // O novo perfil dispara o próximo envio, com o retrato atualizado.
      }
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
      // progresso de gamificação: só quando mudou desde o último envio
      if (!sessao.ativa()) return;
      const progressoJson = JSON.stringify(progressoCapturado);
      if (progressoJson !== atual.current.progressoEnviado) {
        await chamarApi("/aluno/progresso", { token: sessao.token, metodo: "PUT", corpo: progressoCapturado });
        if (!sessao.ativa()) return;
        gravar((x) => ({ ...x, progressoEnviado: progressoJson }));
      }
      setOnline(true);
    } catch (e) {
      tratarErro(e, sessao);
    } finally {
      enviando.current = false;
    }
  }, [capturar, gravar, rostoAtual, tratarErro, perfilLocal, importarPerfil]);

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
    if (!temApi || !sessao) return;
    setCarregandoAtividades(true);
    try {
      await receberNoEscopo(
        sessao,
        (token) => chamarApi<{ atividades: AtividadeDoProfessor[] }>("/aluno/atividades", { token }),
        ({ atividades }) => {
          gravar((x) => ({ ...x, atividades }));
          setOnline(true);
        },
      );
    } catch (e) {
      tratarErro(e, sessao);
    } finally {
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
    const tic = setInterval(() => atual.current.fila.length > 0 && sincronizar(), 60_000);
    return () => {
      clearTimeout(primeira);
      ao.remove();
      clearInterval(tic);
    };
  }, [pronto, jogadorPronto, sincronizar, atualizarAtividades, trazerProgresso, g.conta?.token]);

  // avatar ou progresso mudaram no app: manda para o servidor (com um pequeno atraso,
  // para juntar várias mudanças seguidas num envio só)
  useEffect(() => {
    if (!pronto || !g.conta) return;
    const envio = setTimeout(sincronizar, 1500);
    return () => clearTimeout(envio);
  }, [rostoAtual, retrato, pronto, g.conta, sincronizar]);

  const valor = useMemo<Estado>(
    () => ({
      pronto: pronto && jogadorPronto,
      temServidor: temApi,
      conta: g.conta,
      semTurma: g.semTurma,
      continuarSemTurma: () => gravar((x) => ({ ...x, semTurma: true })),
      pendentes: g.conta ? g.fila.filter((j) => j.alunoId === g.conta!.aluno.id).length : 0,
      recusadas: g.recusadas.length,
      online,
      carregandoAtividades,
      atividades: g.atividades.map((a) => ({ ...a, feita: g.feitas[a.id] ?? a.feita })),
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
      registrarJogada: (r, extra) => {
        const conta = atual.current.conta;
        if (!conta || !capturar()) return;
        const jogada: JogadaParaEnviar = {
          ...r,
          dicas: r.dicas ?? 0,
          id: novoId(),
          alunoId: conta.aluno.id,
          origem: extra.origem,
          atividadeId: extra.atividadeId ?? null,
          titulo: extra.titulo,
        };
        gravar((x) => ({
          ...x,
          fila: [...x.fila, jogada],
          feitas: extra.atividadeId
            ? {
                ...x.feitas,
                [extra.atividadeId]: { percentualAcerto: r.percentualAcerto, estrelas: r.estrelas, data: r.data },
              }
            : x.feitas,
        }));
        setTimeout(sincronizar, 0);
      },
      atualizarAtividades,
      sincronizar,
    }),
    [
      pronto,
      g,
      online,
      carregandoAtividades,
      atualizarAtividades,
      sincronizar,
      capturar,
      escopo,
      selecionar,
      gravar,
      jogadorPronto,
    ],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useConta(): Estado {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConta precisa estar dentro de <ProvedorConta>.");
  return ctx;
}
