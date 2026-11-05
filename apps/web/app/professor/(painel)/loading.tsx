/**
 * Mostrado na hora em que o professor clica numa seção, enquanto a página nova
 * chega do servidor: o esqueleto do título e dos blocos, no lugar exato onde
 * o conteúdo vai aparecer (a tela não fica parada nem "pula").
 */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 rounded-md bg-[#E6E2F5] anim-brilho" />
        <div className="h-9 w-72 max-w-full rounded-lg bg-[#E6E2F5] anim-brilho" />
      </div>
      <div className="h-24 rounded-2xl bg-superficie sombra-suave anim-brilho" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 rounded-2xl bg-superficie sombra-suave anim-brilho" />
        <div className="h-72 rounded-2xl bg-superficie sombra-suave anim-brilho" />
      </div>
    </div>
  );
}
