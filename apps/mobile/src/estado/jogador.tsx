import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  NIVEIS,
  creditarJogada,
  comprarItem,
  constelacaoDoNivel,
  dataEscolar,
  estrelasAcesas,
  mapaConcluido,
  nivelDaMissao,
  type Constelacao,
  type ResultadoJogada,
} from "@modolume/core";
import type { AvatarId } from "@/componentes/Avatar";
import type { Rosto } from "@/componentes/Rosto";
import { normalizar } from "@/componentes/Rosto";
import {
  retirarItensRecusados,
  conciliarProgresso,
  type ControleProgresso,
  type ProgressoRemoto,
} from "./progresso-local";
import { useIdentidade } from "./identidade";

/**
 * Estado do aluno no aparelho: perfil, estrelas por missão, histórico de
 * jogadas, gamificação (pontos de luz por mapa, constelações, dias de luz,
 * desafios do dia) e preferências. Guardado com AsyncStorage.
 */

export interface Jogador {
  nome: string;
  avatar: AvatarId;
  /** Rosto montado no editor de avatar (substitui o símbolo quando existe). */
  rosto?: Rosto;
  /** Capa animada atrás do avatar no perfil (índice em CAPAS). */
  capa?: number;
}

export interface ProgressoMissao {
  estrelas: 0 | 1 | 2 | 3;
  jogadas: number;
  melhorAcerto: number;
}

export interface Preferencias {
  vibracao: boolean;
  /** Todos os níveis abertos (validação/apresentação). */
  liberarTodos: boolean;
}

/** Progresso de gamificação como o servidor guarda (tabelas progresso_missao, pontos_mapa…). */
export type ProgressoServidor = ProgressoRemoto;

interface Salvo extends ControleProgresso {
  bonusDiarios?: Record<string, number>;
  bonusMapas?: Record<string, number>;
  jogador: Jogador | null;
  /** Perfil local editado ou recuperado da mesma identidade no servidor. */
  perfilLocal: boolean;
  progresso: Record<string, ProgressoMissao>;
  resultados: ResultadoJogada[];
  preferencias: Preferencias;
  /** Pontos de luz acumulados em cada mapa (nível). */
  pontosPorNivel: Record<number, number>;
  /** Constelações completas: id → data (YYYY-MM-DD). */
  constelacoes: Record<string, string>;
  /** Dias em que o aluno jogou (YYYY-MM-DD). */
  dias: string[];
  /** Desafios do dia concluídos: data → id da missão. */
  desafios: Record<string, string>;
  /** Luzes já gastas na loja do avatar. */
  gastos: number;
  /** Itens da loja já comprados (ids). */
  compras: string[];
}

/** Perfil inicial da demonstração e base visual do perfil escolar. */
const ALUNO_PADRAO: Jogador = {
  nome: "Ana",
  avatar: "lume",
  rosto: {
    pele: 1,
    cabelo: "wavyBob",
    corCabelo: 1,
    olhos: "cheery",
    boca: "openedSmile",
    acessorio: "nenhum",
    fundo: 0,
  },
};

const VAZIO: Salvo = {
  versaoProgresso: 2,
  dispositivoId: "",
  movimentos: [],
  comprasPendentes: [],
  revisao: -1,
  jogador: ALUNO_PADRAO,
  perfilLocal: false,
  progresso: {},
  resultados: [],
  // durante a validação, todos os níveis ficam abertos
  preferencias: { vibracao: true, liberarTodos: true },
  pontosPorNivel: {},
  constelacoes: {},
  dias: [],
  desafios: {},
  gastos: 0,
  compras: [],
};

/** O que a jogada rendeu — mostrado na tela de resultado. */
export interface Recompensa {
  pontos: number;
  desafio: boolean;
  constelacao: Constelacao;
  nivel: number;
  pontosAntes: number;
  pontosDepois: number;
  acesasAntes: number;
  acesasDepois: number;
  /** A constelação ficou completa nesta jogada. */
  completou: boolean;
  /** Pontos de bônus por concluir todas as missões do mapa. */
  bonusMapa: number;
}

interface Estado extends Salvo {
  pronto: boolean;
  entrar: (j: Jogador) => void;
  editarPerfil: (dados: Partial<Jogador>) => void;
  sair: () => void;
  apagarProgresso: () => void;
  prepararResultado: (r: ResultadoJogada) => { novo: Salvo; recompensa: Recompensa };
  aplicarSnapshot: (novo: Salvo) => void;
  mudarPreferencia: <K extends keyof Preferencias>(k: K, v: Preferencias[K]) => void;
  vibrar: (tipo: "acerto" | "erro" | "toque") => void;
  /** Luzes disponíveis para gastar: pontos de luz ganhos − gastos. */
  luzes: number;
  /** Compra um item da loja; devolve falso se não houver luzes suficientes. */
  comprar: (id: string, preco: number) => boolean;
  /**
   * Junta o progresso guardado no servidor com o do aparelho, sem perder nada:
   * fica o maior valor de cada missão e mapa e a união das conquistas.
   */
  importarProgresso: (p: ProgressoServidor) => void;
  conciliar: (
    p: ProgressoServidor,
    recusadas?: string[],
    comprasRecusadas?: string[],
    confirmarLegado?: boolean,
  ) => Salvo;
  capturarProgresso: () => Salvo;
  importarPerfil: (perfil: { nome: string; rosto?: object }) => void;
}

const Ctx = createContext<Estado | null>(null);

export function ProvedorJogador({ children }: { children: React.ReactNode }) {
  const { conta, escopo, repositorio, selecionar, falhar } = useIdentidade();
  const [pronto, setPronto] = useState(false);
  const [salvo, setSalvo] = useState<Salvo>(VAZIO);
  const atual = useRef<Salvo>(VAZIO);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    repositorio
      .dados<Salvo>("jogador", escopo.identidade, () => ({
        ...VAZIO,
        perfilLocal: !!conta && Object.hasOwn(conta.aluno, "avatar"),
        jogador: conta
          ? {
              ...ALUNO_PADRAO,
              nome: conta.aluno.nome.split(" ")[0]!,
              ...(conta.aluno.avatar?.rosto ? { rosto: normalizar(conta.aluno.avatar.rosto) } : {}),
            }
          : ALUNO_PADRAO,
      }))
      .then(async (lido) => {
        if (montado.current && escopo.ativa()) {
          const s = {
            ...VAZIO,
            ...lido,
            jogador: lido.jogador ? { ...lido.jogador, rosto: lido.jogador.rosto ?? ALUNO_PADRAO.rosto } : ALUNO_PADRAO,
            preferencias: { ...VAZIO.preferencias, ...lido.preferencias },
          };
          if (!s.dispositivoId)
            s.dispositivoId = `aparelho-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
          if (lido.versaoProgresso !== 2) {
            s.legado = {
              progresso: s.progresso,
              pontosPorNivel: s.pontosPorNivel,
              constelacoes: s.constelacoes,
              desafios: s.desafios,
              gastos: s.gastos,
              compras: s.compras,
              dias: s.dias,
            };
          }
          // constelação só fica completa com o mapa inteiro concluído
          s.constelacoes = Object.fromEntries(
            Object.entries(s.constelacoes).filter(([id]) => {
              const nivel = NIVEIS.find((n) => n.constelacao === id);
              return nivel ? mapaConcluido(nivel.numero, s.progresso) : false;
            }),
          );
          await repositorio.salvar("jogador", escopo.identidade, s);
          if (!montado.current || !escopo.ativa()) return;
          atual.current = s;
          setSalvo(s);
          setPronto(true);
        }
      })
      .catch(() => {
        if (montado.current && escopo.ativa()) falhar();
      });
    return () => {
      montado.current = false;
    };
  }, [conta, escopo, repositorio, falhar]);

  const aplicarSnapshot = useCallback(
    (novo: Salvo) => {
      if (!montado.current || !escopo.ativa()) return;
      atual.current = novo;
      setSalvo(novo);
    },
    [escopo],
  );
  const gravar = useCallback(
    (novo: Salvo) => {
      if (!montado.current || !escopo.ativa()) return;
      aplicarSnapshot(novo);
      void repositorio.salvar("jogador", escopo.identidade, novo).catch(() => {
        if (montado.current && escopo.ativa()) falhar();
      });
    },
    [escopo, repositorio, falhar, aplicarSnapshot],
  );

  const importarPerfil = useCallback(
    (perfil: Parameters<Estado["importarPerfil"]>[0]) => {
      const s = atual.current;
      if (s.perfilLocal) return;
      gravar({
        ...s,
        perfilLocal: true,
        jogador: {
          ...(s.jogador ?? ALUNO_PADRAO),
          nome: perfil.nome.split(" ")[0]!,
          ...(perfil.rosto ? { rosto: normalizar(perfil.rosto) } : {}),
        },
      });
    },
    [gravar],
  );

  const importarProgresso = useCallback(
    (p: ProgressoServidor) => {
      const novo = conciliarProgresso(atual.current, p);
      if (JSON.stringify(novo) !== JSON.stringify(atual.current)) gravar(novo);
    },
    [gravar],
  );

  const capturarProgresso = useCallback(() => atual.current, []);
  const conciliar = useCallback(
    (p: ProgressoServidor, recusadas?: string[], comprasRecusadas?: string[], confirmarLegado?: boolean) => {
      const novo = conciliarProgresso(atual.current, p, recusadas, comprasRecusadas, confirmarLegado);
      return novo.jogador && comprasRecusadas?.length
        ? { ...novo, jogador: retirarItensRecusados(novo.jogador, comprasRecusadas) }
        : novo;
    },
    [],
  );

  const valor = useMemo<Estado>(
    () => ({
      ...salvo,
      pronto,
      entrar: (jogador) => gravar({ ...atual.current, jogador, perfilLocal: true }),
      editarPerfil: (dados) =>
        atual.current.jogador &&
        gravar({ ...atual.current, jogador: { ...atual.current.jogador, ...dados }, perfilLocal: true }),
      importarPerfil,
      capturarProgresso,
      conciliar,
      sair: () => {
        if (escopo.ativa()) void selecionar(null).catch(() => {});
      },
      luzes: Object.values(salvo.pontosPorNivel).reduce((a, b) => a + b, 0) - salvo.gastos,
      comprar: (id, _preco) => {
        const s = atual.current;
        const comprado = comprarItem(s, id);
        if (!comprado) return false;
        if (s.compras.includes(id)) return true;
        gravar({ ...s, ...comprado, comprasPendentes: [...s.comprasPendentes, id] });
        return true;
      },
      importarProgresso,
      apagarProgresso: () =>
        gravar({
          ...VAZIO,
          dispositivoId: atual.current.dispositivoId,
          jogador: atual.current.jogador,
          perfilLocal: atual.current.perfilLocal,
          preferencias: atual.current.preferencias,
        }),
      // (apagar progresso também zera luzes e compras)
      mudarPreferencia: (k, v) => gravar({ ...atual.current, preferencias: { ...atual.current.preferencias, [k]: v } }),
      aplicarSnapshot,
      prepararResultado: (r) => {
        const s = atual.current;
        const nivel = nivelDaMissao(r.missaoId)?.numero ?? 1;
        const constelacao = constelacaoDoNivel(nivel);

        const projetado = creditarJogada(s, r);
        const desafio = (projetado.bonusDiarios?.[r.data] ?? 0) > (s.bonusDiarios?.[r.data] ?? 0);
        const pontosAntes = s.pontosPorNivel[nivel] ?? 0;
        const pontosDepois = projetado.pontosPorNivel[nivel] ?? pontosAntes;
        const bonusMapa = Math.max(0, (projetado.bonusMapas?.[nivel] ?? 0) - (s.bonusMapas?.[nivel] ?? 0));
        const pontos = Math.max(0, pontosDepois - pontosAntes - bonusMapa);
        const concluidoAntes = mapaConcluido(nivel, s.progresso);
        const concluido = mapaConcluido(nivel, projetado.progresso);
        const acesasAntes = estrelasAcesas(pontosAntes, constelacao, concluidoAntes);
        const acesasDepois = estrelasAcesas(pontosDepois, constelacao, concluido);
        const completou = acesasDepois === constelacao.estrelas.length && !s.constelacoes[constelacao.id];

        const novo: Salvo = {
          ...s,
          ...projetado,
          resultados: [...s.resultados, r],
          movimentos: conta && r.id ? [...s.movimentos, { id: r.id, resultado: r }] : s.movimentos,
        };

        return {
          novo,
          recompensa: {
            pontos,
            desafio,
            constelacao,
            nivel,
            pontosAntes,
            pontosDepois,
            acesasAntes,
            acesasDepois,
            completou,
            bonusMapa,
          },
        };
      },
      vibrar: (tipo) => {
        if (!salvo.preferencias.vibracao || Platform.OS === "web") return;
        const p =
          tipo === "acerto"
            ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            : tipo === "erro"
              ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
              : Haptics.selectionAsync();
        p.catch(() => {});
      },
    }),
    [
      salvo,
      pronto,
      gravar,
      selecionar,
      escopo,
      aplicarSnapshot,
      importarPerfil,
      importarProgresso,
      capturarProgresso,
      conciliar,
      conta,
    ],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useJogador(): Estado {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useJogador precisa estar dentro de <ProvedorJogador>.");
  return ctx;
}

/** Totais usados em várias telas. */
export function useResumo() {
  const { progresso, constelacoes, dias } = useJogador();
  const valores = Object.values(progresso);
  return {
    estrelas: valores.reduce((s, p) => s + p.estrelas, 0),
    concluidas: valores.length,
    perfeitas: valores.filter((p) => p.estrelas === 3).length,
    constelacoes: Object.keys(constelacoes).length,
    dias: dias.length,
  };
}

/** Hoje, no calendário escolar compartilhado com a API. */
export const hoje = () => dataEscolar();
