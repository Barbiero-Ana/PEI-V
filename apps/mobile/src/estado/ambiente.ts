import type { Armazenamento } from "./isolamento";

/** A produção conserva suas chaves históricas. Outros servidores nunca leem esse espaço. */
export function prefixoDoAmbiente(api: string): string {
  const endereco = api ? new URL(api).href.replace(/\/+$/, "") : "sem-api";
  if (endereco === "https://api.modolume.com.br") return "";
  // Codificação sem perda ou colisões; apenas caracteres aceitos pelo SecureStore.
  const codigo = Array.from(endereco, (c) => c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
  return `modolume.ambiente.${codigo}.`;
}

export function armazenamentoDoAmbiente(storage: Armazenamento, prefixo: string): Armazenamento {
  return {
    getItem: (chave) => storage.getItem(prefixo + chave),
    setItem: (chave, valor) => storage.setItem(prefixo + chave, valor),
  };
}

type Local = Armazenamento & {
  getAllKeys(): Promise<readonly string[]>;
  removeItem(chave: string): Promise<unknown>;
};

export function armazenamentoLocalDoAmbiente(storage: Local, prefixo: string): Local {
  return {
    ...armazenamentoDoAmbiente(storage, prefixo),
    getAllKeys: async () =>
      (await storage.getAllKeys())
        .filter((chave) => (prefixo ? chave.startsWith(prefixo) : !chave.startsWith("modolume.ambiente.")))
        .map((chave) => chave.slice(prefixo.length)),
    removeItem: (chave) => storage.removeItem(prefixo + chave),
  };
}
