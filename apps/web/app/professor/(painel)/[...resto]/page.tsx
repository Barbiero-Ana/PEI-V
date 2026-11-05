import { notFound } from "next/navigation";

/** Qualquer endereço desconhecido em /professor cai na página de "não encontrada" do painel. */
export default function Desconhecida() {
  notFound();
}
