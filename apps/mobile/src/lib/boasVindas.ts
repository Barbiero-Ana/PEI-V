import Storage from "expo-sqlite/kv-store";

/** Lembra se a tela de boas-vindas já foi vista neste aparelho. */
const CHAVE = "modolume:boas-vindas:v1";

export function boasVindasVista() {
  try {
    return Storage.getItemSync(CHAVE) === "1";
  } catch {
    return true;
  }
}

export function marcarBoasVindas() {
  try {
    Storage.setItemSync(CHAVE, "1");
  } catch {
    // sem armazenamento: a tela pode aparecer de novo, sem problema
  }
}
