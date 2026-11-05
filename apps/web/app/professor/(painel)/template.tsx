import type { ReactNode } from "react";

/**
 * Transição entre as páginas do painel: o Next monta o template de novo a cada
 * troca de página, e o conteúdo entra com um esmaecimento curto. Só a opacidade
 * muda (sem deslocamento), para não mexer no layout nem na posição de gavetas e
 * cartões fixos. Some com a redução de movimento do sistema.
 */
export default function TransicaoPainel({ children }: { children: ReactNode }) {
  return <div className="anim-pagina">{children}</div>;
}
