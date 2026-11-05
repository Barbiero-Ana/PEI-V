import { NiveisLista } from "@/componentes/niveis/Lista";
import { NiveisTrilha } from "@/componentes/niveis/Trilha";

/**
 * Layout da tela de Níveis. "trilha" é o rio com as paradas (em teste);
 * "lista" é a versão anterior, com os mapas em cartões que abrem e fecham.
 */
const LAYOUT: "trilha" | "lista" = "trilha";

export default function Niveis() {
  return LAYOUT === "trilha" ? <NiveisTrilha /> : <NiveisLista />;
}
