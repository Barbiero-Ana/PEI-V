import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Questao, ResultadoJogada } from "@modolume/core";
import { ErroApi, chamarApi, semConexao, temApi } from "@/lib/api";
import { normalizar, svgDoRosto } from "@/componentes/Rosto";
import { useJogador, type ProgressoServidor } from "./jogador";

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

export interface ContaAluno {
  token: string;
  aluno: { id: string; nome: string };
  turma: { id: string; nome: string };
}

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

const CHAVE = "modolume:conta:v1";
const VAZIO: Guardado = {
  conta: null,
  fila: [],
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

export function ContaProvider({ children }: { children: ReactNode }) {
  const {
    jogador,
    editarPerfil,
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
  const rostoAtual = jogador?.rosto;

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((bruto) => {
        if (!bruto) return;
        const lido = { ...VAZIO, ...(JSON.parse(bruto) as Partial<Guardado>) };
        atual.current = lido;
        setG(lido);
      })
      .catch(() => {})
      .finally(() => setPronto(true));
  }, []);

  const gravar = useCallback((mudar: (g: Guardado) => Guardado) => {
    const novo = mudar(atual.current);
    atual.current = novo;
    setG(novo);
    AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => {});
  }, []);

  /** Token recusado pelo servidor: sai da turma, mas guarda a fila para quando entrar de novo. */
  const tratarErro = useCallback(
    (e: unknown) => {
      if (semConexao(e)) setOnline(false);
      else if (e instanceof ErroApi && (e.status === 401 || e.status === 403)) gravar((s) => ({ ...s, conta: null }));
    },
    [gravar],
  );

  const sincronizar = useCallback(async () => {
    const s = atual.current;
    if (!temApi || !s.conta || enviando.current) return;
    enviando.current = true;
    try {
      const minhas = s.fila.filter((j) => j.alunoId === s.conta!.aluno.id);
      for (let i = 0; i < minhas.length; i += 100) {
        const lote = minhas.slice(i, i + 100).map(({ alunoId: _a, ...j }) => j);
        const { recebidas } = await chamarApi<{ recebidas: string[] }>("/aluno/jogadas", {
          token: s.conta.token,
          metodo: "POST",
          corpo: { jogadas: lote },
        });
        const ok = new Set(recebidas);
        gravar((x) => ({ ...x, fila: x.fila.filter((j) => !ok.has(j.id)) }));
      }
      // avatar: só quando mudou desde o último envio
      if (rostoAtual) {
        const rosto = normalizar(rostoAtual);
        const svg = svgDoRosto(rosto, 96);
        if (svg !== atual.current.avatarEnviado) {
          await chamarApi("/aluno/eu", { token: s.conta.token, metodo: "PATCH", corpo: { avatar: { rosto, svg } } });
          gravar((x) => ({ ...x, avatarEnviado: svg }));
        }
      }
      // progresso de gamificação: só quando mudou desde o último envio
      const progressoJson = JSON.stringify(retratoAtual.current);
      if (progressoJson !== atual.current.progressoEnviado) {
        await chamarApi("/aluno/progresso", { token: s.conta.token, metodo: "PUT", corpo: retratoAtual.current });
        gravar((x) => ({ ...x, progressoEnviado: progressoJson }));
      }
      setOnline(true);
    } catch (e) {
      tratarErro(e);
    } finally {
      enviando.current = false;
    }
  }, [gravar, rostoAtual, tratarErro]);

  /** Traz o progresso guardado no servidor (de outros aparelhos) e junta com o daqui. */
  const trazerProgresso = useCallback(async () => {
    const conta = atual.current.conta;
    if (!temApi || !conta) return;
    try {
      importarProgresso(await chamarApi<ProgressoServidor>("/aluno/progresso", { token: conta.token }));
    } catch (e) {
      tratarErro(e);
    }
  }, [importarProgresso, tratarErro]);

  const atualizarAtividades = useCallback(async () => {
    const conta = atual.current.conta;
    if (!temApi || !conta) return;
    setCarregandoAtividades(true);
    try {
      const { atividades } = await chamarApi<{ atividades: AtividadeDoProfessor[] }>("/aluno/atividades", {
        token: conta.token,
      });
      gravar((x) => ({ ...x, atividades }));
      setOnline(true);
    } catch (e) {
      tratarErro(e);
    } finally {
      setCarregandoAtividades(false);
    }
  }, [gravar, tratarErro]);

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
      pronto,
      temServidor: temApi,
      conta: g.conta,
      semTurma: g.semTurma,
      continuarSemTurma: () => gravar((x) => ({ ...x, semTurma: true })),
      pendentes: g.conta ? g.fila.filter((j) => j.alunoId === g.conta!.aluno.id).length : 0,
      online,
      carregandoAtividades,
      atividades: g.atividades.map((a) => ({ ...a, feita: g.feitas[a.id] ?? a.feita })),
      identificar: (codigo) =>
        chamarApi<IdentificacaoAluno>("/auth/aluno/codigo", { metodo: "POST", corpo: { codigo } }),
      entrar: async (codigo, pin) => {
        const r = await chamarApi<{
          token: string;
          aluno: { id: string; nome: string; avatar: { rosto?: object; svg?: string } | null };
          turma: ContaAluno["turma"];
        }>("/auth/aluno", { metodo: "POST", corpo: { codigo, pin } });
        // em outro aparelho, o aluno recupera o avatar que já tinha (MOD-HIS-006)
        const rostoDoServidor = r.aluno.avatar?.rosto ? normalizar(r.aluno.avatar.rosto) : null;
        editarPerfil({ nome: r.aluno.nome.split(" ")[0], ...(rostoDoServidor ? { rosto: rostoDoServidor } : {}) });
        // o que o aluno já conquistou em outro aparelho volta para este (MOD-HIS-006)
        try {
          importarProgresso(await chamarApi<ProgressoServidor>("/aluno/progresso", { token: r.token }));
        } catch {
          // sem o progresso do servidor agora; ele é enviado e juntado na próxima sincronização
        }
        gravar((x) => ({
          ...x,
          conta: { token: r.token, aluno: { id: r.aluno.id, nome: r.aluno.nome }, turma: r.turma },
          semTurma: false,
          progressoEnviado: "",
          avatarEnviado: r.aluno.avatar?.svg ?? "",
          atividades: [],
        }));
        setOnline(true);
      },
      sairDaTurma: () => gravar((x) => ({ ...x, conta: null, atividades: [] })),
      registrarJogada: (r, extra) => {
        const conta = atual.current.conta;
        if (!conta) return;
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
          fila: [...x.fila, jogada].slice(-500),
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
      editarPerfil,
      gravar,
      importarProgresso,
    ],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useConta(): Estado {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConta precisa estar dentro de <ContaProvider>.");
  return ctx;
}
