import Link from "next/link";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { CAMPO, ROTULO } from "@/components/escola/formulario";
import { ListaRegistros } from "@/components/escola/registro";
import { apiDaEquipe } from "@/lib/escola/api";
import { GRUPOS_DE_ACAO, type PaginaRegistros, type Pessoa } from "@/lib/escola/tipos";

/** Registro de atividades (auditoria): só cresce; ninguém altera nem apaga pela API. */
export default async function Registros({
  searchParams,
}: {
  searchParams: Promise<{ acao?: string; usuarioId?: string; pagina?: string }>;
}) {
  const f = await searchParams;
  const consulta = new URLSearchParams();
  if (f.acao) consulta.set("acao", f.acao);
  if (f.usuarioId) consulta.set("usuarioId", f.usuarioId);
  const pagina = Math.max(1, Number(f.pagina) || 1);
  consulta.set("pagina", String(pagina));

  const [r, pessoas] = await Promise.all([
    apiDaEquipe<PaginaRegistros>(`/admin/registros?${consulta}`),
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
  ]);
  const paginas = Math.max(1, Math.ceil(r.total / r.porPagina));
  const link = (n: number) => {
    const q = new URLSearchParams(consulta);
    q.set("pagina", String(n));
    return `/admin/registros?${q}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Registro de atividades"
        descricao="Quem fez o quê e quando: entradas no painel, mudanças de permissão, turmas, vínculos e acesso dos alunos. O registro só cresce: ninguém altera nem apaga."
      />

      <form className="flex flex-wrap items-end gap-4" method="get">
        <div className="flex min-w-[220px] flex-col gap-1.5">
          <label htmlFor="filtro-acao" className={ROTULO}>
            Tipo de ação
          </label>
          <select id="filtro-acao" name="acao" defaultValue={f.acao ?? ""} className={CAMPO}>
            {GRUPOS_DE_ACAO.map((g) => (
              <option key={g.valor} value={g.valor}>
                {g.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[220px] flex-col gap-1.5">
          <label htmlFor="filtro-pessoa" className={ROTULO}>
            Pessoa
          </label>
          <select id="filtro-pessoa" name="usuarioId" defaultValue={f.usuarioId ?? ""} className={CAMPO}>
            <option value="">Todas as pessoas</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-xl bg-roxo px-4 font-display text-sm font-semibold text-white hover:bg-roxo-escuro"
        >
          Filtrar
        </button>
        {f.acao || f.usuarioId ? (
          <Link
            href="/admin/registros"
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-roxo-escuro"
          >
            Limpar filtros
          </Link>
        ) : null}
      </form>

      <Painel titulo={`${r.total} registros`} semRecuo>
        <ListaRegistros registros={r.registros} vazio="Nenhum registro com esses filtros." />
        {paginas > 1 ? (
          <nav
            aria-label="Páginas"
            className="flex items-center justify-between border-t border-[#E6E2F3] px-5 py-3 text-sm"
          >
            {pagina > 1 ? (
              <Link href={link(pagina - 1)} className="font-semibold text-roxo-escuro">
                ← Mais recentes
              </Link>
            ) : (
              <span />
            )}
            <span className="text-texto-suave">
              Página {pagina} de {paginas}
            </span>
            {pagina < paginas ? (
              <Link href={link(pagina + 1)} className="font-semibold text-roxo-escuro">
                Mais antigos →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </Painel>
    </div>
  );
}
