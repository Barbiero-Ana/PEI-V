import { ROTULO_STATUS, type PlanoAula } from "@/lib/painel/planejamento";
import { Etiqueta } from "./blocos";

/** Etiqueta da situação do plano; aula que já passou sem registro aparece como pendente. */
export function SituacaoPlano({ plano, hoje }: { plano: Pick<PlanoAula, "status" | "data">; hoje: string }) {
  if (plano.status === "realizada") return <Etiqueta tom="ok">Realizada</Etiqueta>;
  if (plano.data < hoje) return <Etiqueta tom="alerta">Sem registro</Etiqueta>;
  return <Etiqueta tom={plano.status === "rascunho" ? "neutro" : "roxo"}>{ROTULO_STATUS[plano.status]}</Etiqueta>;
}
