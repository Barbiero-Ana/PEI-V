import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { useUltimo } from "@/lib/useUltimo";
import { gravarPrefs, lerPrefs, type PrefsAcessibilidade } from "@/lib/acessibilidadeSalva";
import { aplicarContraste } from "@/tema";

/**
 * Acessibilidade em tempo real: tudo vale na hora. O alto contraste troca a
 * paleta do tema e as telas são redesenhadas com ela (ver _layout).
 */

interface ContextoAcessibilidade extends PrefsAcessibilidade {
  /** Menos animações pela opção do app ou pela configuração do aparelho. */
  animacoesReduzidas: boolean;
  mudar: (dados: Partial<PrefsAcessibilidade>) => void;
  falar: (texto: string) => void;
}

const Contexto = createContext<ContextoAcessibilidade | null>(null);

function falarAgora(texto: string) {
  Speech.stop();
  Speech.speak(texto, { language: "pt-BR", rate: 0.95 });
}

export function AcessibilidadeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(lerPrefs);
  const [sistemaReduz, setSistemaReduz] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSistemaReduz);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setSistemaReduz);
    return () => sub.remove();
  }, []);

  const atual = useUltimo(prefs);
  const mudar = useCallback(
    (dados: Partial<PrefsAcessibilidade>) => {
      const novo = { ...atual.current, ...dados };
      gravarPrefs(novo);
      aplicarContraste(novo.altoContraste);
      setPrefs(novo);
      if (dados.voz === false) Speech.stop();
    },
    [atual],
  );

  const valor = useMemo<ContextoAcessibilidade>(
    () => ({
      ...prefs,
      animacoesReduzidas: prefs.menosAnimacoes || sistemaReduz,
      mudar,
      falar: (texto) => {
        if (prefs.voz && texto.trim()) falarAgora(texto);
      },
    }),
    [prefs, sistemaReduz, mudar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAcessibilidade() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useAcessibilidade fora do AcessibilidadeProvider");
  return c;
}

/** Lê um texto em voz alta sempre que a tela ganha foco (se a voz estiver ligada). */
export function useFalarAoAbrir(texto: string) {
  const { falar, voz } = useAcessibilidade();
  useFocusEffect(
    useCallback(() => {
      if (!voz) return;
      falar(texto);
      return () => Speech.stop();
    }, [falar, voz, texto]),
  );
}

/** Lê o exemplo da tela de configurações mesmo com a voz ainda desligada. */
export function falarExemplo(texto: string) {
  falarAgora(texto);
}
