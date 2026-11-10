import Storage from "expo-sqlite/kv-store";

/**
 * Preferências de acessibilidade, lidas de forma síncrona: o tema precisa
 * saber do alto contraste antes de qualquer tela montar os estilos.
 */

export type EscalaTexto = 1 | 1.15 | 1.3;

export interface PrefsAcessibilidade {
  escala: EscalaTexto;
  voz: boolean;
  menosAnimacoes: boolean;
  dislexia: boolean;
  altoContraste: boolean;
}

export const PREFS_PADRAO: PrefsAcessibilidade = {
  escala: 1,
  voz: false,
  menosAnimacoes: false,
  dislexia: false,
  altoContraste: false,
};

const CHAVE = "modolume:acessibilidade:v1";

export function lerPrefs(): PrefsAcessibilidade {
  try {
    const salvo = Storage.getItemSync(CHAVE);
    return salvo ? { ...PREFS_PADRAO, ...(JSON.parse(salvo) as Partial<PrefsAcessibilidade>) } : PREFS_PADRAO;
  } catch {
    return PREFS_PADRAO;
  }
}

export function gravarPrefs(prefs: PrefsAcessibilidade) {
  try {
    Storage.setItemSync(CHAVE, JSON.stringify(prefs));
  } catch {
    // sem armazenamento (ex.: navegador privado): a preferência vale só nesta sessão
  }
}
