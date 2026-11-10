import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  NIVEIS,
  constelacaoDoNivel,
  dataLocal,
  desafioDoDia,
  estrelasAcesas,
  mapaConcluido,
  nivelDaMissao,
  pontosDaJogada,
  pontosNecessarios,
  type Constelacao,
  type ResultadoJogada,
} from "@modolume/core";
import type { AvatarId } from "@/componentes/Avatar";
import type { Rosto } from "@/componentes/Rosto";
import { normalizar } from "@/componentes/Rosto";
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
export interface ProgressoServidor {
  progresso: Record<string, ProgressoMissao>;
  pontosPorNivel: Record<string, number>;
  constelacoes: Record<string, string>;
  desafios: Record<string, string>;
  gastos: number;
  compras: string[];
  dias?: string[];
}

interface Salvo {
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
      .then((lido) => {
        if (montado.current && escopo.ativa()) {
          const s = {
            ...VAZIO,
            ...lido,
            jogador: lido.jogador ? { ...lido.jogador, rosto: lido.jogador.rosto ?? ALUNO_PADRAO.rosto } : ALUNO_PADRAO,
            preferencias: { ...VAZIO.preferencias, ...lido.preferencias },
          };
          // constelação só fica completa com o mapa inteiro concluído
          s.constelacoes = Object.fromEntries(
            Object.entries(s.constelacoes).filter(([id]) => {
              const nivel = NIVEIS.find((n) => n.constelacao === id);
              return nivel ? mapaConcluido(nivel.numero, s.progresso) : false;
            }),
          );
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
      const s = atual.current;
      const progresso = { ...s.progresso };
      for (const [id, v] of Object.entries(p.progresso)) {
        const a = progresso[id];
        progresso[id] = {
          estrelas: Math.max(a?.estrelas ?? 0, v.estrelas) as 0 | 1 | 2 | 3,
          jogadas: Math.max(a?.jogadas ?? 0, v.jogadas),
          melhorAcerto: Math.max(a?.melhorAcerto ?? 0, v.melhorAcerto),
        };
      }
      const pontosPorNivel = { ...s.pontosPorNivel };
      for (const [n, v] of Object.entries(p.pontosPorNivel))
        pontosPorNivel[Number(n)] = Math.max(pontosPorNivel[Number(n)] ?? 0, v);
      const novo: Salvo = {
        ...s,
        progresso,
        pontosPorNivel,
        constelacoes: { ...p.constelacoes, ...s.constelacoes },
        desafios: { ...p.desafios, ...s.desafios },
        gastos: Math.max(s.gastos, p.gastos),
        compras: [...new Set([...s.compras, ...p.compras])],
        dias: [...new Set([...s.dias, ...(p.dias ?? [])])].sort(),
      };
      if (JSON.stringify(novo) !== JSON.stringify(s)) gravar(novo);
    },
    [gravar],
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
      sair: () => {
        if (escopo.ativa()) void selecionar(null).catch(() => {});
      },
      luzes: Object.values(salvo.pontosPorNivel).reduce((a, b) => a + b, 0) - salvo.gastos,
      comprar: (id, preco) => {
        const s = atual.current;
        const saldo = Object.values(s.pontosPorNivel).reduce((a, b) => a + b, 0) - s.gastos;
        if (s.compras.includes(id)) return true;
        if (saldo < preco) return false;
        gravar({ ...s, gastos: s.gastos + preco, compras: [...s.compras, id] });
        return true;
      },
      importarProgresso,
      apagarProgresso: () =>
        gravar({
          ...VAZIO,
          jogador: atual.current.jogador,
          perfilLocal: atual.current.perfilLocal,
          preferencias: atual.current.preferencias,
        }),
      // (apagar progresso também zera luzes e compras)
      mudarPreferencia: (k, v) => gravar({ ...atual.current, preferencias: { ...atual.current.preferencias, [k]: v } }),
      aplicarSnapshot,
      prepararResultado: (r) => {
        const s = atual.current;
        const hoje = r.data;
        const nivel = nivelDaMissao(r.missaoId)?.numero ?? 1;
        const constelacao = constelacaoDoNivel(nivel);

        // desafio do dia vale em dobro, uma vez por dia
        const desafio = desafioDoDia(hoje).id === r.missaoId && !s.desafios[hoje];
        const pontos = pontosDaJogada(r, desafio);
        const pontosAntes = s.pontosPorNivel[nivel] ?? 0;
        let pontosDepois = pontosAntes + pontos;
        // concluiu todas as missões do mapa: a constelação acende inteira
        const concluidoAntes = mapaConcluido(nivel, s.progresso);
        const concluido = mapaConcluido(nivel, { ...s.progresso, [r.missaoId]: true });
        const bonusMapa = concluido ? Math.max(0, pontosNecessarios(constelacao) - pontosDepois) : 0;
        pontosDepois += bonusMapa;
        const acesasAntes = estrelasAcesas(pontosAntes, constelacao, concluidoAntes);
        const acesasDepois = estrelasAcesas(pontosDepois, constelacao, concluido);
        const completou = acesasDepois === constelacao.estrelas.length && !s.constelacoes[constelacao.id];

        const anterior = s.progresso[r.missaoId];
        const novo: Salvo = {
          ...s,
          resultados: [...s.resultados, r],
          progresso: {
            ...s.progresso,
            [r.missaoId]: {
              estrelas: Math.max(anterior?.estrelas ?? 0, r.estrelas) as 0 | 1 | 2 | 3,
              jogadas: (anterior?.jogadas ?? 0) + 1,
              melhorAcerto: Math.max(anterior?.melhorAcerto ?? 0, r.percentualAcerto),
            },
          },
          pontosPorNivel: { ...s.pontosPorNivel, [nivel]: pontosDepois },
          constelacoes: completou ? { ...s.constelacoes, [constelacao.id]: hoje } : s.constelacoes,
          dias: s.dias.includes(hoje) ? s.dias : [...s.dias, hoje],
          desafios: desafio ? { ...s.desafios, [hoje]: r.missaoId } : s.desafios,
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
    [salvo, pronto, gravar, selecionar, escopo, aplicarSnapshot, importarPerfil, importarProgresso],
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

/** Hoje, no fuso do aparelho. */
export const hoje = () => dataLocal();
